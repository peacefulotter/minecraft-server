import type { WorkerMessage } from './message'

declare var self: Worker

const FRAMERATES = 30
const TICK_TIME = 1000 / FRAMERATES

const update = async (delta: number) => {
    console.log(delta)
}

// We pick the floor of `tickLengthMs - 1` because the `setImmediate` below runs
// around 16ms later and if our coarse-grained 'long wait' is too long, we tend
// to miss our target framerate by a little bit
const INTERVAL_TIME = Math.floor(TICK_TIME - 1)

let prev = performance.now()

const loop = setInterval(async () => {
    const now = performance.now()
    const delta = now - prev
    await update(delta)
    prev = performance.now()
}, INTERVAL_TIME)

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
    console.log(event.data)
}

self.onerror = () => {
    loop.unref()
}
