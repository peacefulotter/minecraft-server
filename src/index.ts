import { watch } from 'fs'
import path from 'path'
import chalk from 'chalk'
import { log } from './logger'
import { Server } from './net/server'

{
    let serve = Bun.serve
    Bun.serve = (x: any) =>
        serve({
            ...x,
            websocket: x.websocket
                ? {
                      ...x.websocket,
                      maxPayloadLength: 10_000_000_000,
                  }
                : undefined,
        })
}

// make TypeScript happy
declare global {
    var server: Server
    var socket: any
}

// ============================= toString overrides =============================
import Long from 'long'
;(Long.prototype as any)[Bun.inspect.custom] = function () {
    return `Long { ${this.toString()} }`
}

import { Vec3 } from 'vec3'
;(Vec3.prototype as any)[Bun.inspect.custom] = function () {
    return `Vec3 { ${this.x}, ${this.y}, ${this.z} }`
}

import BitSet from 'bitset'
import type { TCPSocketListener } from 'bun'
;(BitSet.prototype as any)[Bun.inspect.custom] = function () {
    return `BitSet { ${this.toString()} }`
}
// ============================= ================== =============================

globalThis.server ??= new Server()
globalThis.socket ??= Bun.listen({
    hostname: '127.0.0.1',
    port: 25565,
    // async fetch(req, server) {
    //     console.log(req)
    //     server.upgrade(req)
    // },
    socket: globalThis.server,
})
const loc = chalk.cyan(
    `${globalThis.socket.hostname}:${globalThis.socket.port}`
)
log(`${chalk.blueBright('Server')} listening on ${loc}`)

// watch(path.join(import.meta.dir, 'worker'), (event, filename) => {
//     console.log(`Detected ${event} in ${filename}`)
//     console.clear()
//     socket.stop()
//     socket = runSocket()
// })
