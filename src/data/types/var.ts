import { PacketBuffer } from '~/net/PacketBuffer'
import { DataByte, type Type } from '.'
import Long from 'long'

const SEGMENT_BITS = 0x7f
const CONTINUE_BIT = 0x80

class _VarInt implements Type<number> {
    async read(buffer: PacketBuffer) {
        let value = 0
        let position = 0

        while (true) {
            const byte = await DataByte.read(buffer)

            value |= (byte & SEGMENT_BITS) << position

            if ((byte & CONTINUE_BIT) == 0) break

            position += 7

            if (position >= 32) throw new Error('VarInt is too big')
        }

        return value
    }

    async write(t: number) {
        const buffer = []
        while (true) {
            if ((t & ~SEGMENT_BITS) == 0) {
                buffer.push(t)
                break
            }

            buffer.push((t & SEGMENT_BITS) | CONTINUE_BIT)

            // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
            t = t >>> 7
        }
        return PacketBuffer.from(buffer)
    }
}

// TODO: /!\ Fix issue with negative longs
class _VarLong implements Type<Long> {
    async read(buffer: PacketBuffer) {
        let value = new Long(0, 0)
        let position = 0

        while (true) {
            const byte = await DataByte.read(buffer)

            value = value.or(new Long(byte & SEGMENT_BITS).shiftLeft(position))

            if ((byte & CONTINUE_BIT) == 0) break

            position += 7

            if (position >= 64) throw new Error('VarLong is too big')
        }

        return value
    }

    async write(t: Long) {
        const buffer: number[] = []
        while (true) {
            if (t.and(~SEGMENT_BITS).eq(0)) {
                buffer.push(t.toNumber())
                break
            }

            buffer.push(t.and(SEGMENT_BITS).or(CONTINUE_BIT).toNumber())

            t = t.shiftRight(7)
        }
        return PacketBuffer.from(buffer)
    }
}

export const VarInt = new _VarInt()
export const VarLong = new _VarLong()
