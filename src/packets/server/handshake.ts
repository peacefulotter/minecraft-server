import { Byte, Int, Short, String, VarInt, type Type } from '~/types/basic'
import { ServerBoundPacket } from '../create'
import type { ClientState } from '~/client'

export const Handshake = new ServerBoundPacket(0x00, 'Handshake', {
    protocol: VarInt,
    hostname: String,
    port: Short,
    nextState: VarInt as Type<ClientState.STATUS | ClientState.LOGIN>,
})

export const LegacyServerListPing = new ServerBoundPacket(
    0xfe,
    'LegacyServerListPing',
    {
        fa: Byte, // fa
        // mcLen: Short, // 11
        mc: String, // MC|PingHost
        restLen: Short, // 7 + len(hostname)
        protocol: Byte,
        hostnameLen: Short, // len(hostname)
        hostname: String,
        port: Int, // TODO: check that this is indeed int and not varint
    }
)
