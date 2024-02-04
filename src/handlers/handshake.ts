import { Handshake, LegacyServerListPing } from '~/packets/server-bound'
import type { Handler, HandlerArgs } from '.'
import { MINECRAFT_SERVER_VERSION, PROTOCOL_VERSION } from '~/constants'

export class HandshakeHandler implements Handler {
    handle = async (args: HandlerArgs) => {
        const { client, buffer, packetId } = args
        console.log(
            '====================================',
            'this.handleHandshake'
        )
        console.log(buffer)
        const packet = Handshake(buffer, client.encrypted)
        console.log({ packetId, ...packet })
        client.state = packet.nextState
    }

    // https://wiki.vg/Server_List_Ping#1.6
    // TODO: implement
    handleLegacyServerListPing = async ({
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
