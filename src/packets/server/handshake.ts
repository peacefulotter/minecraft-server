import {
    DataByte,
    DataInt,
    DataShort,
    DataString,
    VarInt,
    type Type,
} from '~/data-types/basic'
import type { ClientState } from '~/client'
import { ServerBoundPacketCreator } from '../create'

export const Handshake = ServerBoundPacketCreator(0x00, 'Handshake', {
    protocol: VarInt,
    hostname: DataString,
    port: DataShort,
    nextState: VarInt as Type<ClientState.STATUS | ClientState.LOGIN>,
})

export const LegacyServerListPing = ServerBoundPacketCreator(
    0xfe,
    'LegacyServerListPing',
    {
        fa: DataByte, // fa
        // mcLen: Short, // 11
        mc: DataString, // MC|PingHost
        restLen: DataShort, // 7 + len(hostname)
        protocol: DataByte,
        hostnameLen: DataShort, // len(hostname)
        hostname: DataString,
        port: DataInt, // TODO: check that this is indeed int and not varint
    }
)
