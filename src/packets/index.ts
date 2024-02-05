import { DataByteArray, DataInt, VarInt } from '~/data-types/basic'
import { createClientBoundPacket } from './create'

export type PacketId = number

const WriteResponseFormat = createClientBoundPacket(
    0x00, // unused
    'WriteResponseFormat',
    {
        // NOTE: since packetLen needs bufferLen to be defined,
        // we compute bufferLen separately
        // This is not ideal and if other packets need prev things as well
        // then consider refactor createWritePacket (implement a "construction" state, and concat at the end)
        bufferLen: VarInt,
        packetId: DataInt,
        packetLen: VarInt,
        packet: DataByteArray,
    }
)

export const formatResponse = (packetId: number, packet: Buffer) => {
    const bufferLen = packet.length
    const bufferLenLen = VarInt.write(packet.length).length
    return WriteResponseFormat({
        bufferLen,
        packetId,
        packetLen: bufferLen + bufferLenLen + 1,
        packet,
    })
}
