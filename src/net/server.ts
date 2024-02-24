import type { SocketId, SocketWithId } from '../socket'
import { MainHandler } from '../handlers/main'
import { Client } from './client'
import { log } from '../logger'
import { unwrap } from './packets/server'
import { type PacketId } from './packets'
import { GameLoop } from '~/worker/loop'
import type { ClientBoundPacket } from './packets/create'
import { EntityHandler } from '~/entity/Handler'
import { nanoid } from 'nanoid'

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
    // private loop = new GameLoop(this.clients)
    entities: EntityHandler = new EntityHandler()

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
        origin: Client, // Client originating the broadcast
        packet: ClientBoundPacket | ClientBoundPacket[]
    ) => {
        for (const [socketId, client] of Object.entries(this.clients)) {
            if (parseInt(socketId) === origin.socket.id) continue
            client.write(packet)
        }
    }

    data = async (socket: SocketWithId, data: Buffer) => {
        const client = this.clients[socket.id]
        const packets = await unwrap(data)
        for (const packet of packets) {
            await this.handlePacket(client, packet)
        }
    }

    open = (socket: SocketWithId) => {
        const client = new Client(socket)
        this.entities.addPlayer(client)
        this.clients[client.entityId] = client
        socket.id = client.entityId
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
