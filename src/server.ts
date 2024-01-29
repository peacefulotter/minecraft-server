import leb128 from 'leb128'
import shortid from 'shortid'
import { readVarInt } from './formats'
import { PacketIdToName, PacketNameToId, type PacketId } from './packet'
import { IMAGE } from './image'
import type { SocketId, SocketState, SocketWithId } from './socket'
import { ConnectionState } from './handlers/connection'
import { MainHandler } from './handlers/main'

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
    private database: Record<SocketId, SocketState> = {}
    private handler = new MainHandler()

    getPacketFormat = (data: Buffer) => {
        let buffer = data.toJSON().data
        const length = readVarInt(buffer)

        // Handle legacy server list ping
        if (length == PacketNameToId.legacy_server_list_ping) {
            return {
                packetId: PacketNameToId.legacy_server_list_ping as PacketId,
                buffer,
            }
        } else buffer = buffer.slice(0, length)
        const packetId = readVarInt(buffer) as PacketId
        return { packetId, buffer }
    }

    formatPing = (packet: Buffer) => {
        console.log('====================================', 'this.handlePing')
        const packetLengthBuffer = leb128.signed.encode(packet.length + 1)
        console.log(packet, packetLengthBuffer)
        return Buffer.concat([
            packetLengthBuffer,
            Buffer.from([PacketNameToId.ping]),
            packet,
        ])
    }

    formatResponse = (packetId: PacketId, packet: Buffer) => {
        const respLengthBuffer = leb128.signed.encode(packet.length)
        const packetLengthBuffer = leb128.signed.encode(
            packet.length + respLengthBuffer.length + 1
        )

        return Buffer.concat([
            packetLengthBuffer,
            Buffer.from([packetId]), // FIXME: works for now, but what about packetIds > 255
            respLengthBuffer,
            packet,
        ])
    }

    data = async (socket: SocketWithId, data: Buffer) => {
        const state = this.database[socket.id]

        const { packetId, buffer } = this.getPacketFormat(data)
        const name = PacketIdToName.get(packetId)
        console.log('Received packet', {
            socketId: socket.id,
            packetId,
            name,
        })

        if (!name) {
            console.log('Unknown packet', {
                socketId: socket.id,
                packetId,
                name,
            })
            return
        }

        const packet = await this.handler[name]({
            socket,
            state,
            packetId,
            buffer,
        })
        if (!packet) return

        console.log(PacketNameToId, PacketIdToName)
        console.log(packetId, PacketNameToId.ping)
        console.log(packetId === PacketNameToId.ping)

        const response =
            packetId === PacketNameToId.ping
                ? this.formatPing(packet)
                : this.formatResponse(packetId, packet)
        console.log('Responding packet', {
            socketId: socket.id,
            packetId,
            response,
        })
        socket.write(response)
    }

    open = (socket: SocketWithId) => {
        const id = shortid.generate()
        socket.id = id
        this.database[id] = {
            connection: ConnectionState.NONE,
        }
        console.log('Socket connected', socket.id)
    }
    close = (socket: SocketWithId) => {
        console.log('Socket disconnected', socket.id)
        delete this.database[socket.id]
    }

    error = (socket: SocketWithId, error: object) => {
        console.log(JSON.stringify(error, null, 2))
    }
}
