import shortid from 'shortid'
import path from 'path'
import type { SocketId, SocketWithId } from '../socket'
import { MainHandler } from '../handlers/main'
import { Client } from './client'
import { log } from '../logger'
import { unwrap } from './packets/server'
import { type PacketId } from './packets'
import type { WorkerMessage } from '~/worker/message'
import { GameLoop } from '~/worker/loop'
import type { ClientBoundPacket } from './packets/create'

// class ServerWorker {
//     private worker: Worker

//     constructor() {
//         const workerURL = new URL(
//             path.join('..', 'worker', 'worker.ts'),
//             import.meta.url
//         ).href
//         this.worker = new Worker(workerURL)
//         this.worker.onmessage = this.onMessage
//     }

//     post = (message: WorkerMessage) => {
//         this.worker.postMessage(message)
//     }

//     private onMessage = (event: MessageEvent<WorkerMessage>) => {
//         console.log(event.data)
//     }
// }

export class Server {
    // TODO: will see later if we need to use a worker
    // private worker: ServerWorker = new ServerWorker()
    private clients: Record<SocketId, Client> = {}
    private handler = new MainHandler()
    private loop = new GameLoop(this.clients)

    handlePacket = async (
        client: Client,
        { packetId, buffer }: { packetId: PacketId; buffer: number[] }
    ) => {
        const response = await this.handler.handle({
            server: this,
            client,
            packetId,
            buffer,
        })

        if (!response) return

        client.write(response)
    }

    broadcast = (
        socket: SocketWithId,
        packet: ClientBoundPacket | ClientBoundPacket[]
    ) => {
        for (const [socketId, client] of Object.entries(this.clients)) {
            if (socketId === socket.id) continue
            client.write(packet)
        }
    }

    data = async (socket: SocketWithId, data: Buffer) => {
        const client = this.clients[socket.id]
        const packets = unwrap(data)
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
