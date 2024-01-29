import { ConnectionHandler } from './connection'
import { Packets, type PacketId, type PacketName } from '../packet'
import type { SocketState, SocketWithId } from '../socket'
import * as formatting from '../formats'

export type HandlerArgs = {
    socket: SocketWithId
    state: SocketState
    packetId: PacketId
    buffer: number[]
}

interface IMainHandler
    extends Record<PacketName, (args: HandlerArgs) => Promise<Buffer | void>> {}

export class MainHandler implements IMainHandler {
    handshake = new ConnectionHandler()

    passToHandshake = async (args: HandlerArgs) => {
        return this.handshake.handle(args)
    };

    [Packets.STATUS] = this.passToHandshake;
    [Packets.PING] = this.passToHandshake;

    // https://wiki.vg/Server_List_Ping#1.6
    [Packets.LEGACY_SERVER_LIST_PING] = async ({
        socket,
        packetId,
        buffer,
    }: HandlerArgs) => {
        formatting.readByte(buffer) // fa
        const len = formatting.readShort(buffer) // 11
        formatting.readString(buffer, len) // MC|PingHost
        formatting.readShort(buffer) // 7 + len(hostname)
        const protocol = formatting.readByte(buffer)
        const hostnameLen = formatting.readShort(buffer) // len(hostname)
        const hostname = formatting.readString(buffer, hostnameLen)
        const port = formatting.readInt(buffer)

        console.log({
            packetId,
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
