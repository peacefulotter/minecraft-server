import { type Client } from '~/net/client'
import { PlayClientBoundKeepAlive } from '~/net/packets/client'
import type { SocketId } from '~/socket'

const FRAMERATES = 30
const TICK_TIME = 1000 / FRAMERATES
// We pick the floor of `tickLengthMs - 1` because the `setImmediate` below runs
// around 16ms later and if our coarse-grained 'long wait' is too long, we tend
// to miss our target framerate by a little bit
const INTERVAL_TIME = Math.floor(TICK_TIME - 1)

export class GameLoop {
    prev = performance.now()

    constructor(private readonly clients: Record<SocketId, Client>) {
        setInterval(async () => {
            const now = performance.now()
            const delta = now - this.prev
            await this.update(delta)
            this.prev = performance.now()
        }, INTERVAL_TIME)
    }

    private refreshClients = async (delta: number) => {
        for (const client of Object.values(this.clients)) {
            client.refreshIn -= delta
            if (client.refreshIn > 0) continue
            await client.checkAlive()
        }
    }

    private update = async (delta: number) => {
        await this.refreshClients(delta)
    }
}
