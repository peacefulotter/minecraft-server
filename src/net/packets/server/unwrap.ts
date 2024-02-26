import { VarInt } from '~/data/types'
import type { PacketId } from '..'
import type { PacketBuffer } from '~/net/PacketBuffer'

const LEGACY_SERVER_LIST_PING_ID = 254

// function hasGzipHeader(data) {
//     var head = new Uint8Array(data.slice(0, 2));
//     return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
// }

export type PacketIdAndOffset = {
    packetId: PacketId
    offset: number
}

export const unwrap = async (buffer: PacketBuffer, offset: number) => {
    // Handle legacy server list ping
    if (buffer.get(0) == LEGACY_SERVER_LIST_PING_ID) {
        return {
            packetLen: buffer.length,
            packetId: LEGACY_SERVER_LIST_PING_ID,
            offset: buffer.length,
        }
    }

    const { t: packetLen, length: packetLenLen } = await VarInt.read(
        buffer,
        offset
    )
    const { t: packetId, length: packetIdLen } = await VarInt.read(
        buffer,
        offset
    )
    return { packetId, packetLen, offset: packetLenLen + packetIdLen }
}
