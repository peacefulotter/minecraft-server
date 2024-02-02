import { createWritePacket, formats } from '~/formats'

const WriteResponseFormat = createWritePacket({
    // NOTE: since packetLen needs bufferLen to be defined,
    // we compute bufferLen separately
    // This is not ideal and if other packets need prev things as well
    // then consider refactor createWritePacket (implement a "construction" state, and concat at the end)
    bufferLen: formats.write.bytes,
    packetId: formats.write.int,
    packetLen: formats.write.int,
    packet: formats.write.bytes,
})

export const formatResponse = (packetId: number, packet: Buffer) => {
    const bufferLen = formats.write.int(packet.length)
    return WriteResponseFormat({
        bufferLen,
        packetId,
        packetLen: packet.length + bufferLen.length + 1,
        packet,
    })
}
