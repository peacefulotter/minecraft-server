import { ByteArray, VarInt } from '~/types/basic'
import { createClientBoundPacket } from '../create'

export const WrapResponse = createClientBoundPacket(
    0x00, // Unused
    {
        packetLen: VarInt,
        packetId: VarInt,
        buffer: ByteArray,
    }
)
