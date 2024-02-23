import { Handshake, LegacyServerListPing } from '~/net/packets/server'
import { MINECRAFT_SERVER_VERSION, PROTOCOL_VERSION } from '~/constants'
import { Handler } from '.'

export const HandshakeHandler = Handler.init('Handshake')

    .register(Handshake, async (args) => {
        const { client, packet } = args
        client.state = packet.nextState
    })

    // https://wiki.vg/Server_List_Ping#1.6
    // TODO: fix this
    .register(LegacyServerListPing, async ({ packetId, packet }) => {
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
    })
