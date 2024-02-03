import { PacketNameToId } from '~/packet'
import { createWritePacket } from './create'
import {
    ByteArray,
    String,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/types/basic'
import { HANDSHAKE_RESPONSE } from '~/constants'

export const WrapPing = createWritePacket(
    {
        packetLen: VarInt,
        packetId: VarInt,
        buffer: ByteArray,
    },
    0x01
)

export const WrapResponse = createWritePacket(
    {
        packetLen: VarInt,
        packetId: VarInt,
        buffer: VarIntPrefixedByteArray,
    },
    0x00
)

export const Ping = createWritePacket(
    {
        payload: ByteArray,
    },
    0x01
)

export const HandshakeResponse = () =>
    createWritePacket(
        {
            json: ByteArray,
        },
        0x00
    )({ json: HANDSHAKE_RESPONSE })

export const EncryptionRequest = createWritePacket(
    {
        serverId: String,
        publicKey: VarIntPrefixedByteArray,
        verifyToken: VarIntPrefixedByteArray,
    },
    0x01
)

export const LoginSuccess = createWritePacket(
    {
        uuid: String,
        username: String,
    },
    0x02
)
