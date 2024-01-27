import { readVarInt } from './var'
import { PacketHandler, packetIdToName } from './packet'
import type { TCPSocket } from 'bun'
import { IMAGE } from './image'

type PacketState = string // TODO

export class Server {
    public static PROTOCOL_VERSION = 765 as const
    public static MINECRAFT_SERVER_VERSION = '1.20.4' as const
    public static WELCOME_MESSAGE = 'Welcome to the server!' as const
    public static IMAGE = IMAGE

    private sockets: Record<number, PacketState> = {}
    private handler = new PacketHandler()

    getPacketFormat = (data: Buffer) => {
        let buffer = data.toJSON().data
        const length = readVarInt(buffer)

        // Packets.LEGACY_SERVER_LIST_PING
        if (length == 254) {
            return { id: 254, buffer }
        }

        buffer = buffer.slice(0, length)
        const id = readVarInt(buffer)
        return { id, buffer }
    }

    data = (socket: TCPSocket, data: Buffer) => {
        const { id, buffer } = this.getPacketFormat(data)
        const name = packetIdToName[id]
        console.log('Received packet with id', id, 'name', name)

        const res = this.handler.emit(name, { socket, id, buffer })
        if (res) {
            console.log('Received packet with id', id, 'res', res)
            socket.write(Buffer.from([id, ...res]))
        }
    }

    open = (socket: TCPSocket) => {
        console.log('Socket connected')
        // this.sockets[socket.id] = 'handshaking'
    }
    close = (socket: TCPSocket) => console.log('Socket closed')

    error = (socket: TCPSocket, error: object) => {
        console.log(JSON.stringify(error, null, 2))
    }

    onData = (data: Buffer) => {}
}
