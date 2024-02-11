import { DataByteArray, VarInt } from '~/data-types/basic'
import { ClientBoundPacketCreator } from '../create'

export const WrapResponse = ClientBoundPacketCreator(
    0x00, // Unused
    'WrapResponse',
    {
        packetLen: VarInt,
        id: VarInt,
        data: DataByteArray,
    }
)
