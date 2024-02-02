import { Server } from './server'

// const server = net.createServer((socket) => {
//     new Server(socket)
// })

// server.listen(25565, () => {
//     console.log('server is listening')
// })

const socket = Bun.listen({
    hostname: 'localhost',
    port: 25565,
    socket: new Server(),
})
console.log('Server listening on ', socket.hostname, ':', socket.port)
