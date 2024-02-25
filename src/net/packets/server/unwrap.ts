import { VarInt } from '~/data/types'
import type { PacketId } from '..'

const LEGACY_SERVER_LIST_PING_ID = 254

// function hasGzipHeader(data) {
//     var head = new Uint8Array(data.slice(0, 2));
//     return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
// }

const unwrapSingle = async (buffer: number[]) => {
    // Handle legacy server list ping
    if (buffer[0] == LEGACY_SERVER_LIST_PING_ID) {
        return {
            packetLen: buffer.length,
            packetId: LEGACY_SERVER_LIST_PING_ID,
            buffer,
        }
    }

    const packetLen = await VarInt.read(buffer)
    const packetId = await VarInt.read(buffer)
    const newBuffer = buffer.slice(0, packetLen - 1) // - 1 to account for the packet id
    return { packetId, buffer: newBuffer, packetLen }
}

export const unwrap = async (data: Buffer) => {
    let buffer = data.toJSON().data

    const packets: { packetId: PacketId; buffer: number[] }[] = []
    while (buffer.length > 0) {
        const {
            packetId,
            buffer: newBuffer,
            packetLen,
        } = await unwrapSingle(buffer)

        if (packetLen > 0) {
            packets.push({ packetId, buffer: newBuffer })
            buffer = buffer.slice(packetLen - 1)
        }
    }
    return packets
}
