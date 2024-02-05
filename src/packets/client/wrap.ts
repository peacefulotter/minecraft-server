import { DataByteArray, VarInt } from '~/data-types/basic'
import { createClientBoundPacket } from '../create'

export const WrapResponse = createClientBoundPacket(
    0x00, // Unused
    'WrapResponse',
    {
        packetLen: VarInt,
        packetId: VarInt,
        buffer: DataByteArray,
    }
)
