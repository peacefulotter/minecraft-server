import { createWritePacket } from './create'
import {
    ByteArray,
    String,
    UUID,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/types/basic'
import { STATUS_RESPONSE } from '~/constants'

export const WrapResponse = createWritePacket(
    {
        packetLen: VarInt,
        packetId: VarInt,
        buffer: ByteArray,
    },
    0x00 // Unused
)

export const PingResponse = createWritePacket(
    {
        payload: ByteArray,
    },
    0x01
)

export const StatusResponse = () =>
    createWritePacket(
        {
            json: String,
        },
        0x00
    )({ json: STATUS_RESPONSE })

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
