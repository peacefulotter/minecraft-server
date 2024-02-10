import shortid from 'shortid'
import type { SocketId, SocketWithId } from './socket'
import { MainHandler } from './handlers/main'
import { Client, ClientState } from './client'
import { VarInt } from './data-types/basic'
import { log } from './logger'
import type { ClientBoundPacket } from './packets/create'
import { WrapResponse } from './packets/client'
import { Unwrap } from './packets/server'
import chalk from 'chalk'
import type { PacketId } from './packets'

export class Server {
    private clients: Record<SocketId, Client> = {}
    private handler = new MainHandler()

    formatPacket = async (packet: ClientBoundPacket, client: Client) => {
        const packetLen = packet.data.length + VarInt.write(packet.id).length
        const res = await WrapResponse.create({
            packetLen,
            ...packet,
        })

        log(
            chalk.redBright('Responding'),
            'packet',
            chalk.rgb(150, 255, 0)(packet.id + ' : ' + packet.name),
            'for state',
            chalk.cyan(ClientState[client.state]),
            'packet length:',
            packetLen,
            'data:',
            res.data
        )

        return res
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

        if (!response || !response.data) return

        const packet = await this.formatPacket(response, client)

        client.write(packet)
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
