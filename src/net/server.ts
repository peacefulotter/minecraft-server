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
import { BlockHandler } from '~/blocks/handler'
import { World } from '~/world/mca'

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

    // TODO: this.clients duplicate as this.entities.players, do we want this?
    private readonly clients: Record<SocketId, Client> = {}
    private readonly handler = new MainHandler()
    private readonly loop = new GameLoop(this.clients)
    readonly cmd = new CommandHandler()
    readonly world = new World([
        'r.0.0.mca',
        'r.0.-1.mca',
        'r.-1.0.mca',
        'r.-1.-1.mca',
    ])

    entities: EntityHandler = new EntityHandler()
    blocks: BlockHandler = new BlockHandler()

    async handlePacket(client: Client, buffer: PacketBuffer, packetId: number) {
        const res = await this.handler.handle({
            server: this,
            client,
            packetId,
            buffer,
        })

        if (res) await client.write(res)
    }

    async broadcast(
        origin: Client, // Client originating the broadcast
        packet: ClientBoundPacket | ClientBoundPacket[]
    ) {
        for (const [socketId, client] of Object.entries(this.clients)) {
            if (parseInt(socketId) === origin.socket.id) continue
            await client.write(packet)
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

    open = async (socket: SocketWithId) => {
        console.log('azdazadazdzdazdazda')

        const client = new Client(socket)
        this.clients[client.entityId] = client
        socket.id = client.entityId
        log('Socket connected', socket.id)
    }

    close = async (socket: SocketWithId) => {
        log('Socket disconnected', socket.id)
        const client = this.clients[socket.id]

        // Remove player from entities
        const removed = this.entities.removePlayer(client)
        if (removed) {
            // Broadcast player remove message
            await this.broadcast(
                client,
                await PlayerInfoRemove.serialize({
                    players: [client.entityUUID],
                })
            )
        }
        // finally, remove client from clients list
        delete this.clients[socket.id]
    }

    async error(socket: SocketWithId, error: object) {
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
