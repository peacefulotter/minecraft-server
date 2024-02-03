import { ByteArray, Int, VarInt } from '~/types/basic'
import { createWritePacket } from './create'

const WriteResponseFormat = createWritePacket({
    // NOTE: since packetLen needs bufferLen to be defined,
    // we compute bufferLen separately
    // This is not ideal and if other packets need prev things as well
    // then consider refactor createWritePacket (implement a "construction" state, and concat at the end)
    bufferLen: VarInt,
    packetId: Int,
    packetLen: VarInt,
    packet: ByteArray,
})

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
