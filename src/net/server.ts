import type { SocketId, SocketWithId } from '../socket'
import { MainHandler } from '../handlers/main'
import { Client } from './client'
import { log } from '../logger'
import { GameLoop } from '~/worker/loop'
import type { ClientBoundPacket } from './packets/create'
import { EntityHandler } from '~/entity/handler'
import { PlayerInfoRemove } from './packets/client'
import { CommandHandler } from '~/commands/handler'
import { unwrap } from './packets/server/unwrap'
import { PacketBuffer } from './PacketBuffer'

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
    cmd = new CommandHandler()
    entities: EntityHandler = new EntityHandler()

    handlePacket = async (
        client: Client,
        buffer: PacketBuffer,
        packetId: number
    ) => {
        const res = await this.handler.handle({
            server: this,
            client,
            packetId,
            buffer,
        })

        if (res) await client.write(res)
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
        const buffer = new PacketBuffer(data)

        while (buffer.readOffset < buffer.length) {
            const { packetId, packetLen } = await unwrap(buffer)

            if (packetLen === 0) {
                continue
            }

            await this.handlePacket(client, buffer, packetId)
        }
    }

    open = (socket: SocketWithId) => {
        const client = new Client(socket)
        console.log(client)
        this.entities.addPlayer(client)
        this.clients[client.entityId] = client
        socket.id = client.entityId
        log('Socket connected', socket.id)
    }

    close = async (socket: SocketWithId) => {
        log('Socket disconnected', socket.id)
        const client = this.clients[socket.id]
        this.entities.removePlayer(client)
        this.broadcast(
            client,
            await PlayerInfoRemove({
                players: [client.entityUUID],
            })
        )
        delete this.clients[socket.id]
    }

    error = (socket: SocketWithId, error: object) => {
        log(JSON.stringify(error, null, 2))
    }

    // public toString(): string {
    //     return `Server
    //         # clients: ${Object.keys(this.clients).length}
    //     `
    // }

    // public [Symbol.toPrimitive](): string {
    //     return this.toString()
    // }

    // public [Symbol.for('nodejs.util.inspect.custom')](): string {
    //     return this.toString()
    // }
}
