import { PacketNameToId } from '~/packet'
import { createWritePacket } from './create'
import {
    Byte,
    ByteArray,
    String,
    UUID,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/types/basic'
import { HANDSHAKE_RESPONSE } from '~/constants'

export const WrapResponse = createWritePacket(
    {
        packetLen: VarInt,
        packetId: VarInt,
        buffer: ByteArray,
    },
    0x00 // Unused
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
            json: String,
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
        uuid: UUID,
        username: String,
        numberOfProperties: VarInt,
    },
    0x02
)
