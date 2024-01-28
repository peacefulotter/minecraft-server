import { Server } from './server'

// const server = net.createServer((socket) => {
//     new Server(socket)
// })

// server.listen(25565, () => {
//     console.log('server is listening')
// })

Bun.listen({
    hostname: '10.0.16.209',
    port: 25565,
    socket: new Server(),
})
