import { Handshake, LegacyServerListPing } from '~/packets/server'
import { Handler, type Args, link } from '.'
import { MINECRAFT_SERVER_VERSION, PROTOCOL_VERSION } from '~/constants'

export class HandshakeHandler extends Handler {
    constructor() {
        super('Handshake', [
            link(Handshake, HandshakeHandler.onHandshake),
            link(LegacyServerListPing, HandshakeHandler.onLegacyServerListPing),
        ])
    }

    static onHandshake = async (args: Args<typeof Handshake>) => {
        const { client, packet, packetId } = args
        client.state = packet.nextState
    }

    // https://wiki.vg/Server_List_Ping#1.6
    // TODO: implement
    static onLegacyServerListPing = async ({
        packetId,
        packet,
    }: Args<typeof LegacyServerListPing>) => {
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
