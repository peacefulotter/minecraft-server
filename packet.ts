import { Server } from './server'
import {
    readByte,
    readInt,
    readShort,
    readString,
    readVarInt,
    writeVarInt,
} from './var'
import { Emitter } from './event'
import type { TCPSocket } from 'bun'

export const Packets = {
    PING: 'ping',
    STATUS: 'status',
    LEGACY_SERVER_LIST_PING: 'legacy_server_list_ping',
} as const

export type PacketNames = (typeof Packets)[keyof typeof Packets]

export const packetIdToName: Record<number, PacketNames> = {
    0x00: Packets.STATUS,
    0xfe: Packets.LEGACY_SERVER_LIST_PING,
} as const

export type PacketId = keyof typeof packetIdToName
export type PacketName = (typeof packetIdToName)[keyof typeof packetIdToName]

type PacketEmitterArgs = { socket: TCPSocket; id: PacketId; buffer: number[] }

type PacketEmitter = Record<
    PacketNames,
    {
        params: PacketEmitterArgs
        return: number[] | void
    }
>

export class PacketHandler extends Emitter<PacketEmitter> {
    constructor() {
        super()
        this.on(Packets.PING, this.ping)
        this.on(Packets.STATUS, this.status)
        this.on(Packets.LEGACY_SERVER_LIST_PING, this.legacyServerListPing)
    }

    ping = ({ buffer }: PacketEmitterArgs) => {
        return [...buffer]
    }

    status = ({ id, buffer }: PacketEmitterArgs) => {
        const protocol = readVarInt(buffer)
        buffer.shift()
        const hostname = readString(buffer, buffer.length - 3)
        const port = readShort(buffer)
        const nextState = readVarInt(buffer)
        console.log({ id, protocol, hostname, port, nextState })

        const res = Buffer.from(
            JSON.stringify({
                version: {
                    name: Server.MINECRAFT_SERVER_VERSION,
                    protocol: Server.PROTOCOL_VERSION,
                },
                players: {
                    max: 69,
                    online: 42,
                    sample: [],
                },
                description: {
                    text: Server.WELCOME_MESSAGE,
                },
                // favicon: `data:image/png;base64,${Server.IMAGE}`,
                enforcesSecureChat: true,
                previewsChat: true,
            })
        )
        const bufLen = writeVarInt(res.length)
        return [...bufLen, ...res]
    }

    // https://wiki.vg/Server_List_Ping#1.6
    legacyServerListPing = ({ socket, id, buffer }: PacketEmitterArgs) => {
        readByte(buffer) // fa
        const len = readShort(buffer) // 11
        readString(buffer, len) // MC|PingHost
        readShort(buffer) // 7 + len(hostname)
        const protocol = readByte(buffer)
        const hostnameLen = readShort(buffer) // len(hostname)
        const hostname = readString(buffer, hostnameLen)
        const port = readInt(buffer)

        console.log({
            id,
            protocol,
            hostname,
            port,
        })

        const tag = Buffer.from('§1')
        const version = Buffer.from(Server.MINECRAFT_SERVER_VERSION)
        const message = Buffer.from('This is a message!')
        const delimiter = Buffer.from([0x00, 0x00])

        const res = [
            0xff,
            0,
            0,
            ...tag,
            ...delimiter,
            Server.PROTOCOL_VERSION,
            ...delimiter,
            ...version,
            ...delimiter,
            ...message,
            ...delimiter,
            42,
            ...delimiter,
            69,
        ]
        const hex = Array.from(res).map((b) => b.toString(16).padStart(2, '0'))
        console.log(res)
        console.log(hex)
        socket.write(Buffer.from(res))
    }
}
