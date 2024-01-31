import { Server } from './server'

// const server = net.createServer((socket) => {
//     new Server(socket)
// })

// server.listen(25565, () => {
//     console.log('server is listening')
// })

const socket = Bun.listen({
    hostname: '192.168.1.67',
    port: 25565,
    socket: new Server(),
})
console.log('Server listening on ', socket.hostname, ':', socket.port)
