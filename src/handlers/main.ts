import { ConnectionHandler } from './connection'
import { Packets, type PacketId, type PacketName } from '~/packet'
import type { Client } from '~/client'
import { MINECRAFT_SERVER_VERSION, PROTOCOL_VERSION } from '~/constants'
import { LegacyServerListPing } from '~/packets/server-bound'
import type { ClientBoundPacket } from '~/packets/create'

export type HandlerArgs = {
    client: Client
    packetId: PacketId
    buffer: number[]
}

interface IMainHandler
    extends Record<
        PacketName,
        (args: HandlerArgs) => Promise<ClientBoundPacket | void>
    > {}

export class MainHandler implements IMainHandler {
    connectionHandler = new ConnectionHandler()

    passToConnection = async (args: HandlerArgs) => {
        return await this.connectionHandler.handle(args)
    };

    [Packets.STATUS] = this.passToConnection;
    [Packets.PING] = this.passToConnection;
    [Packets.LOGIN] = this.passToConnection;

    // https://wiki.vg/Server_List_Ping#1.6
    [Packets.LEGACY_SERVER_LIST_PING] = async ({
        client,
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
        // client.write(Buffer.from(res))
    }
}
