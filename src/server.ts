import shortid from 'shortid'
import type { SocketId, SocketWithId } from './socket'
import { MainHandler } from './handlers/main'
import { Client } from './client'
import { VarInt } from './types/basic'
import { byteToHex, log } from './logger'
import type { ClientBoundPacket } from './packets/create'
import type { PacketId } from './packet'
import { WrapResponse } from './packets/client'
import { Unwrap } from './packets/server'

export class Server {
    private clients: Record<SocketId, Client> = {}
    private handler = new MainHandler()

    formatPacket = (response: ClientBoundPacket) => {
        log('2) Formatting response', {
            ...response,
            bufferLen: response.buffer.length,
        })
        const packetLen =
            response.buffer.length + VarInt.write(response.packetId).length
        return WrapResponse({
            packetLen,
            ...response,
        })
    }

    handlePacket = async (
        client: Client,
        { packetId, buffer }: { packetId: PacketId; buffer: number[] }
    ) => {
        log('1) Received packet', {
            socketId: client.socket.id,
            packetId,
        })

        const response = await this.handler.handle({
            client,
            packetId,
            buffer,
        })

        if (!response || !response.buffer) return

        const packet = this.formatPacket(response)

        log('3) Responding packet', {
            socketId: client.socket.id,
            packetId: `${byteToHex(packetId)} -> ${byteToHex(
                response.packetId
            )}`,
            header: packet.buffer.subarray(
                0,
                packet.buffer.length - response.buffer.length
            ),
        })
        client.write(packet.buffer)
    }

    data = async (socket: SocketWithId, data: Buffer) => {
        const client = this.clients[socket.id]
        const packets = Unwrap(data)
        for (const packet of packets) {
            await this.handlePacket(client, packet)
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
