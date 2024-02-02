import { createWritePacket, format } from '~/formats'

const WriteResponseFormat = createWritePacket({
    // NOTE: since packetLen needs bufferLen to be defined,
    // we compute bufferLen separately
    // This is not ideal and if other packets need prev things as well
    // then consider refactor createWritePacket (implement a "construction" state, and concat at the end)
    bufferLen: format.write.bytes,
    packetId: format.write.int,
    packetLen: format.write.int,
    packet: format.write.bytes,
})

export const formatResponse = (packetId: number, packet: Buffer) => {
    const bufferLen = format.write.int(packet.length)
    return WriteResponseFormat({
        bufferLen,
        packetId,
        packetLen: packet.length + bufferLen.length + 1,
        packet,
    })
}
