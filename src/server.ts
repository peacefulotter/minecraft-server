import leb128 from 'leb128'
import shortid from 'shortid'
import { PacketIdToName, PacketNameToId, type PacketId } from './packet'
import type { SocketId, SocketWithId } from './socket'
import { MainHandler } from './handlers/main'
import { Client, ClientState } from './client'
import { Unwrap } from './packets/read'
import { WrapPing, WrapResponse } from './packets/write'
import { formats } from './formats'

export class Server {
    private clients: Record<SocketId, Client> = {}
    private handler = new MainHandler()

    formatPing = (packet: Buffer) => {
        const packetLen = packet.length + 1
        return WrapPing({
            packetLen,
            packet,
        })
    }

    formatResponse = (packetId: PacketId, buffer: Buffer) => {
        const bufferLen = buffer.length
        const packetLen = buffer.length + formats.write.varint(bufferLen).length + 1

        return WrapResponse({
            packetLen,
            packetId,
            bufferLen,
            buffer,
        })
    }

    isPingPacket = (client: Client, packetId: PacketId) =>
        packetId === PacketNameToId.ping &&
        (client.state === ClientState.NONE || client.state === ClientState.HANDSHAKE)

    formatPacket = (client: Client, packetId: PacketId, packet: Buffer) => {
        return this.isPingPacket(client, packetId)
            ? this.formatPing(packet)
            : this.formatResponse(packetId, packet)
    }

    // TODO: future
    // send = (client: Client, packetId: PacketId, packet: Buffer) => {
    //     const formattedPacket = this.formatPacket(client, packetId, packet)
    //     socket.write(formattedPacket)
    // }

    data = async (socket: SocketWithId, data: Buffer) => {
        const client = this.clients[socket.id]

        const { packetId, buffer } = Unwrap(data)
        const name = PacketIdToName.get(packetId)
        console.log('Received packet', {
            socketId: socket.id,
            packetId,
            name,
        })

        if (!name) {
            console.log('Unknown packet', {
                socketId: socket.id,
                packetId,
                name,
            })
            return
        }

        const response = await this.handler[name]({
            socket,
            client,
            packetId,
            buffer,
        })
        if (!response || !response.responseBuffer) return

        const { responsePacketId, responseBuffer } = response
        const responseId = responsePacketId ?? packetId

        const packet = this.formatPacket(client, responseId, responseBuffer)

        console.log('Responding packet', {
            socketId: socket.id,
            packetId,
            responsePacketId,
            response,
            packet,
        })
        socket.write(packet)
    }

    open = (socket: SocketWithId) => {
        const id = shortid.generate()
        socket.id = id
        this.clients[id] = new Client()
        console.log('Socket connected', socket.id)
    }
    close = (socket: SocketWithId) => {
        console.log('Socket disconnected', socket.id)
        delete this.clients[socket.id]
    }

    error = (socket: SocketWithId, error: object) => {
        console.log(JSON.stringify(error, null, 2))
    }
}
