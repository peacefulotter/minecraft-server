import { log } from '~/logger'
import { VarInt } from '~/data-types/basic'
import type { PacketId } from '..'

const LEGACY_SERVER_LIST_PING_ID = 254

// function hasGzipHeader(data) {
//     var head = new Uint8Array(data.slice(0, 2));
//     return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
// }

const UnwrapSingle = (buffer: number[]) => {
    // Handle legacy server list ping
    if (buffer[0] == LEGACY_SERVER_LIST_PING_ID) {
        return {
            packetLen: buffer.length,
            packetId: LEGACY_SERVER_LIST_PING_ID,
            buffer,
        }
    }

    const packetLen = VarInt.read(buffer)
    const packetId = VarInt.read(buffer)
    const newBuffer = buffer.slice(0, packetLen - 1) // - 1 to account for the packet id
    console.log('Unwrapping single', { packetLen, packetId, newBuffer })
    return { packetId, buffer: newBuffer, packetLen }
}

export const Unwrap = (data: Buffer) => {
    let buffer = data.toJSON().data

    log('Unwrapping', data)

    const packets: { packetId: PacketId; buffer: number[] }[] = []
    while (buffer.length > 0) {
        const { packetId, buffer: newBuffer, packetLen } = UnwrapSingle(buffer)
        if (packetLen > 0) {
            packets.push({ packetId, buffer: newBuffer })
            buffer = buffer.slice(packetLen - 1)
        }
    }
    log('Unwrapping', packets)

    return packets
}
