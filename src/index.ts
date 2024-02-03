import { Server } from './server'

const socket = Bun.listen({
    hostname: 'localhost',
    port: 25565,
    socket: new Server(),
})
console.log('Server listening on ', socket.hostname, ':', socket.port)
