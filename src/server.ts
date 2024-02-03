import shortid from 'shortid'
import { PacketIdToName, PacketNameToId, type PacketId } from './packet'
import type { SocketId, SocketWithId } from './socket'
import { MainHandler } from './handlers/main'
import { Client, ClientState } from './client'
import { Unwrap } from './packets/server-bound'
import { WrapPing, WrapResponse } from './packets/client-bound'
import { VarInt } from './types/basic'
import { log } from './logger'
import type { ClientBoundPacket } from './packets/create'

export class Server {
    private clients: Record<SocketId, Client> = {}
    private handler = new MainHandler()

    formatPing = ({ buffer }: ClientBoundPacket) => {
        const packetLen = buffer.length + 1
        return WrapPing({
            packetLen,
            packetId: PacketNameToId.ping,
            buffer,
        })
    }

    formatResponse = ({ packetId, buffer }: ClientBoundPacket) => {
        const bufferLen = buffer.length
        const packetLen = bufferLen + VarInt.write(bufferLen).length + 1
        log('Formatting response', {
            packetId,
            bufferLen,
            packetLen,
            buffer: buffer.toJSON().data,
        })
        return WrapResponse({
            packetLen,
            packetId,
            buffer,
        })
    }

    isPingPacket = (client: Client, packetId: number) =>
        packetId === PacketNameToId.ping &&
        (client.state === ClientState.HANDSHAKING ||
            client.state === ClientState.STATUS)

    formatPacket = (client: Client, response: ClientBoundPacket) => {
        return this.isPingPacket(client, response.packetId)
            ? this.formatPing(response)
            : this.formatResponse(response)
    }

    handlePacket = async (
        client: Client,
        { packetId, buffer }: { packetId: PacketId; buffer: number[] }
    ) => {
        const name = PacketIdToName.get(packetId)
        log('1) Received packet', {
            socketId: client.socket.id,
            packetId,
            name,
        })

        if (!name) {
            log('2) Unknown packet', {
                socketId: client.socket.id,
                packetId,
                name,
            })
            return
        }

        const response = await this.handler[name]({
            client,
            packetId,
            buffer,
        })
        console.log('2) RESPONSE', response)

        if (!response || !response.buffer) return

        const packet = this.formatPacket(client, response)

        log('3) Responding packet', {
            socketId: client.socket.id,
            packetId,
            responsePacketId: response.packetId,
            response,
            packet,
        })
        client.write(packet.buffer)
    }

    data = async (socket: SocketWithId, data: Buffer) => {
        const client = this.clients[socket.id]
        const packets = Unwrap(data)
        for (const packet of packets) {
            this.handlePacket(client, packet)
        }
    }

    open = (socket: SocketWithId) => {
        const id = shortid.generate()
        socket.id = id
        const client = new Client(socket)
        this.clients[id] = client
        log('Socket connected', socket.id)
    }
    close = (socket: SocketWithId) => {
        log('Socket disconnected', socket.id)
        delete this.clients[socket.id]
    }

    error = (socket: SocketWithId, error: object) => {
        log(JSON.stringify(error, null, 2))
    }
}
