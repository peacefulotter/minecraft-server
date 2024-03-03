import { watch } from 'fs'
import path from 'path'
import chalk from 'chalk'
import { log } from './logger'
import { Server } from './net/server'

// ============================= toString overrides =============================
import Long from 'long'
;(Long.prototype as any)[Bun.inspect.custom] = function () {
    return `Long { ${this.toString()} }`
}

import { Vec3 } from 'vec3'
;(Vec3.prototype as any)[Bun.inspect.custom] = function () {
    return `Vec3 { ${this.x}, ${this.y}, ${this.z} }`
}
// ============================= ================== =============================

const runSocket = () => {
    const socket = Bun.listen({
        hostname: 'localhost',
        port: 25565,
        socket: new Server(),
    })
    log('Server listening on', chalk.cyan(`${socket.hostname}:${socket.port}`))
    return socket
}

let socket = runSocket()

watch(path.join(import.meta.dir, 'worker'), (event, filename) => {
    console.log(`Detected ${event} in ${filename}`)
    console.clear()
    socket.stop()
    socket = runSocket()
})
