import { watch } from 'fs'
import path from 'path'
import chalk from 'chalk'
import { log } from './logger'
import { Server } from './net/server'

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
