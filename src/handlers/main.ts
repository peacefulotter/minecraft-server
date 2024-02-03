import { ConnectionHandler } from './connection'
import { Packets, type PacketId, type PacketName } from '~/packet'
import type { SocketWithId } from '~/socket'
import type { Client } from '~/client'
import { MINECRAFT_SERVER_VERSION, PROTOCOL_VERSION } from '~/constants'
import { LegacyServerListPing } from '~/packets/read'

export type HandlerArgs = {
    socket: SocketWithId
    client: Client
    packetId: PacketId
    buffer: number[]
}

export type BufferResponse = {
    responsePacketId?: PacketId
    responseBuffer: Buffer | undefined
}

interface IMainHandler
    extends Record<
        PacketName,
        (args: HandlerArgs) => Promise<BufferResponse | void>
    > {}

export class MainHandler implements IMainHandler {
    handshake = new ConnectionHandler()

    passToHandshake = async (args: HandlerArgs) => {
        return await this.handshake.handle(args)
    };

    [Packets.STATUS] = this.passToHandshake;
    [Packets.PING] = this.passToHandshake;

    // https://wiki.vg/Server_List_Ping#1.6
    [Packets.LEGACY_SERVER_LIST_PING] = async ({
        client,
        socket,
        packetId,
        buffer,
    }: HandlerArgs) => {
        const packet = LegacyServerListPing(buffer, client.encrypted)

        console.log({
            packetId,
            ...packet,
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
            PROTOCOL_VERSION,
            ...delimiter,
            MINECRAFT_SERVER_VERSION,
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
