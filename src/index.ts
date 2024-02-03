import chalk from 'chalk'
import { log } from './logger'
import { Server } from './server'

const socket = Bun.listen({
    hostname: 'localhost',
    port: 25565,
    socket: new Server(),
})
log('Server listening on', chalk.cyan(`${socket.hostname}:${socket.port}`))
