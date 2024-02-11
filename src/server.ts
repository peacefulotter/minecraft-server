import shortid from 'shortid'
import type { SocketId, SocketWithId } from './socket'
import { MainHandler } from './handlers/main'
import { Client } from './client'
import { log } from './logger'
import { Unwrap } from './packets/server'
import { type PacketId } from './packets'

export class Server {
    private clients: Record<SocketId, Client> = {}
    private handler = new MainHandler()

    handlePacket = async (
        client: Client,
        { packetId, buffer }: { packetId: PacketId; buffer: number[] }
    ) => {
        const response = await this.handler.handle({
            client,
            packetId,
            buffer,
        })

        if (!response) return

        client.write(response)
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
