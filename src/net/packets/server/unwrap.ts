import { VarInt } from '~/net/types'
import type { PacketBuffer } from '~/net/PacketBuffer'

const LEGACY_SERVER_LIST_PING_ID = 254

// function hasGzipHeader(data) {
//     var head = new Uint8Array(data.slice(0, 2));
//     return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
// }

export const unwrap = async (buffer: PacketBuffer) => {
    // Handle legacy server list ping
    if (buffer.get(0, true) == LEGACY_SERVER_LIST_PING_ID) {
        return {
            packetLen: buffer.length,
            packetId: LEGACY_SERVER_LIST_PING_ID,
            offset: buffer.length,
        }
    }

    const packetLen = await VarInt.read(buffer)
    const packetId = await VarInt.read(buffer)
    return { packetId, packetLen }
}
