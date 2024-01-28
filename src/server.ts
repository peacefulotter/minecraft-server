import leb128 from 'leb128'
import { readVarInt } from './var'
import {
    PacketHandler,
    packetIdToName,
    PacketNameToId,
    type PacketId,
} from './packet'
import type { TCPSocket } from 'bun'
import { IMAGE } from './image'

const PROTOCOL_VERSION = 47 as const
const MINECRAFT_SERVER_VERSION = '1.8.9' as const
const WELCOME_MESSAGE = 'Welcome to the server!' as const

export const HANDSHAKE_RESPONSE = Buffer.from(
    JSON.stringify({
        version: {
            name: MINECRAFT_SERVER_VERSION,
            protocol: PROTOCOL_VERSION,
        },
        players: {
            max: 69,
            online: 42,
        },
        description: {
            text: WELCOME_MESSAGE,
        },
        favicon: `data:image/png;base64,${IMAGE}`,
    })
)

export class Server {
    private handler = new PacketHandler()

    getPacketFormat = (data: Buffer) => {
        let buffer = data.toJSON().data
        const length = readVarInt(buffer)

        if (length == PacketNameToId.legacy_server_list_ping) {
            return {
                id: PacketNameToId.legacy_server_list_ping as PacketId,
                buffer,
            }
        }

        buffer = buffer.slice(0, length)
        const id = readVarInt(buffer) as PacketId
        return { id, buffer }
    }

    formatResponse = (packetId: PacketId, packet: number[]) => {
        const buffer = Buffer.from(packet)
        const respLengthBuffer = leb128.signed.encode(buffer.length)
        const packetLengthBuffer = leb128.signed.encode(
            buffer.length + respLengthBuffer.length + 1
        )

        return Buffer.concat([
            packetLengthBuffer,
            Buffer.from([packetId]), // FIXME: works for now, but what about packetIds > 255
            respLengthBuffer,
            buffer,
        ])
    }

    data = async (socket: TCPSocket, data: Buffer) => {
        const { id, buffer } = this.getPacketFormat(data)
        const name = packetIdToName[id]
        console.log('Received packet', { id, name })

        const packet = await this.handler[name]({ socket, id, buffer })
        if (!packet) return

        const response = this.formatResponse(id, packet)
        console.log('Responding packet', { id, response })
        const done = socket.write(response)
        console.log('wrote', done)
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
