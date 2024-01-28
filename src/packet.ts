import { HANDSHAKE_RESPONSE, Server } from './server'
import {
    readByte,
    readInt,
    readShort,
    readString,
    readVarInt,
    writeVarInt,
} from './var'
import type { TCPSocket } from 'bun'
import { reverseRecord, type ReverseMap } from './utils'
import { Handshake } from './handshake'

export const Packets = {
    STATUS: 'status',
    PING: 'ping',
    LEGACY_SERVER_LIST_PING: 'legacy_server_list_ping',
} as const

export type PacketNames = (typeof Packets)[keyof typeof Packets]

export const packetIdToName = {
    0x00: Packets.STATUS,
    0x01: Packets.PING,
    0xfe: Packets.LEGACY_SERVER_LIST_PING,
} as const

export const PacketNameToId = reverseRecord(packetIdToName) as ReverseMap<
    typeof packetIdToName
>

export type PacketId = keyof typeof packetIdToName
export type PacketName = (typeof packetIdToName)[keyof typeof packetIdToName]

export type PacketEmitterArgs = {
    socket: TCPSocket
    id: PacketId
    buffer: number[]
}

interface PacketEmitter
    extends Record<
        PacketNames,
        (args: PacketEmitterArgs) => Promise<number[] | void>
    > {}

export class PacketHandler implements PacketEmitter {
    handshake = new Handshake()

    passToHandshake = async (args: PacketEmitterArgs) => {
        const res = this.handshake.handle(args)
        return res?.toJSON().data
    };

    [Packets.STATUS] = this.passToHandshake;
    [Packets.PING] = this.passToHandshake;

    // https://wiki.vg/Server_List_Ping#1.6
    [Packets.LEGACY_SERVER_LIST_PING] = async ({
        socket,
        id,
        buffer,
    }: PacketEmitterArgs) => {
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
        // const version = Buffer.from(Server.MINECRAFT_SERVER_VERSION)
        const message = Buffer.from('This is a message!')
        const delimiter = Buffer.from([0x00, 0x00])

        const res = [
            0xff,
            0,
            0,
            ...tag,
            ...delimiter,
            // Server.PROTOCOL_VERSION,
            ...delimiter,
            // ...version,
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
        // socket.write(Buffer.from(res))
    }
}
