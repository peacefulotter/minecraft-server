import leb128 from 'leb128'
import InnerLong from 'long'
import { CONTINUE_BIT, SEGMENT_BITS } from './constants'

export interface Type<T> {
    read: (buffer: number[], length?: number) => T
    write: (t: T) => Buffer
}

export const Boolean: Type<boolean> = class Boolean {
    static read = (buffer: number[]) => {
        return buffer.shift() === 1
    }
    static write = (t: boolean) => {
        return Buffer.from([t ? 1 : 0])
    }
}

export const Byte: Type<number> = class Byte {
    static read = (buffer: number[]) => {
        return buffer.shift() as number
    }
    static write = (t: number) => {
        return Buffer.from([t])
    }
}

export const ByteArray: Type<Buffer> = class Bytes {
    static read = (buffer: number[], length?: number) => {
        const acc: number[] = []
        let i = 0
        while (length === undefined || i++ < length) {
            const element = Byte.read(buffer)
            acc.push(element)
        }
        return Buffer.from(acc)
    }

    static write = (t: Buffer) => {
        return t
    }
}

export const Short: Type<number> = class Short {
    static read = (buffer: number[]) => {
        const b1 = Byte.read(buffer)
        const b2 = Byte.read(buffer)
        return (b1 << 8) | b2
    }

    static write = (t: number) => {
        return Buffer.from([(t >> 8) & 0xffff, t & 0xffff])
    }
}

export const Int: Type<number> = class Int {
    static read = (buffer: number[]) => {
        const b1 = Short.read(buffer)
        const b2 = Short.read(buffer)
        return (b1 << 16) | b2
    }

    static write = (t: number) => {
        return Buffer.concat([
            Short.write((t >> 16) & 0xffffffff),
            Short.write(t & 0xffffffff),
        ])
    }
}

export const Long: Type<InnerLong> = class Long {
    static read = (buffer: number[]) => {
        const b1 = Int.read(buffer)
        const b2 = Int.read(buffer)
        return new InnerLong(b1, b2)
    }

    static write = (t: InnerLong) => {
        console.log('Writing long', t.toNumber())
        const res = Buffer.concat([Int.write(t.high), Int.write(t.low)])
        console.log(res)
        return res
    }
}

export const Float: Type<number> = class Float {
    static SIZE = 4

    static read = (buffer: number[]) => {
        return new DataView(
            ByteArray.read(buffer, Float.SIZE).buffer
        ).getFloat32(0)
    }

    static write = (t: number) => {
        const buffer = new ArrayBuffer(Float.SIZE)
        new DataView(buffer).setFloat32(0, t)
        return Buffer.from(buffer)
    }
}

export const Double: Type<number> = class Double {
    static SIZE = 8

    static read = (buffer: number[]) => {
        return new DataView(
            ByteArray.read(buffer, Double.SIZE).buffer
        ).getFloat64(0)
    }

    static write = (t: number) => {
        const buffer = new ArrayBuffer(Double.SIZE)
        new DataView(buffer).setFloat64(0, t)
        return Buffer.from(buffer)
    }
}

export const UUID: Type<string> = class UUID {
    static SIZE = 16

    static read = (buffer: number[]) => {
        return ByteArray.read(buffer, UUID.SIZE).toString('hex')
    }

    static write = (t: string) => {
        const buffer = Buffer.from(t.replaceAll('-', ''), 'hex')
        return buffer
    }
}

export const String: Type<string> = class String {
    static read = (buffer: number[]) => {
        return VarIntPrefixedByteArray.read(buffer).toString('utf-8')
    }

    static write = (t: string) => {
        const buffer = Buffer.from(t)
        return VarIntPrefixedByteArray.write(buffer)
    }
}

export const VarInt: Type<number> = class VarInt {
    static read = (buffer: number[]) => {
        let value = 0
        let position = 0
        let idx = 0

        while (true) {
            const byte = Byte.read(buffer)

            value |= (byte & SEGMENT_BITS) << position

            if ((byte & CONTINUE_BIT) == 0) break

            position += 7
            idx++

            if (position >= 32) throw new Error('VarInt is too big')
        }

        return value
    }

    static write = (t: number) => {
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
        return Buffer.from(buffer)
    }
}

export const VarLong: Type<InnerLong> = class VarLong {
    static read = (buffer: number[]) => {
        let value = new InnerLong(0)
        let position = 0
        let idx = 0

        while (true) {
            const currentByte = buffer.at(idx)
            if (currentByte === undefined) throw new Error('VarLong is too big')
            value = value.or(
                new InnerLong(currentByte & SEGMENT_BITS).shiftLeft(position)
            )

            if ((currentByte & CONTINUE_BIT) == 0) break

            position += 7
            idx++

            if (position >= 64) throw new Error('VarLong is too big')
        }

        return value
    }

    static write = (t: InnerLong) => {
        const buffer: number[] = []
        while (true) {
            if (t.and(~SEGMENT_BITS).eq(0)) {
                buffer.push(t.toNumber())
                break
            }

            buffer.push(t.and(SEGMENT_BITS).or(CONTINUE_BIT).toNumber())

            t = t.shiftRight(7)
        }
        return Buffer.from(buffer)
    }
}

export const VarIntPrefixedByteArray: Type<Buffer> = class VarIntPrefixedByteArray {
    static read = (buffer: number[]) => {
        const length = VarInt.read(buffer)
        return ByteArray.read(buffer, length)
    }

    static write = (t: Buffer) => {
        const length = t.length
        return Buffer.concat([VarInt.write(length), t])
    }
}

export const Position: Type<{
    x: number
    y: number
    z: number
}> = class Position {
    static read = (buffer: number[]) => {
        const val = Long.read(buffer).toNumber()
        const x = val >> 38
        const y = (val << 52) >> 52
        const z = (val << 26) >> 38
        return { x, y, z }
    }

    static write = (t: { x: number; y: number; z: number }) => {
        const val =
            ((t.x & 0x3ffffff) << 38) |
            ((t.z & 0x3ffffff) << 12) |
            (t.y & 0xfff)
        return Long.write(InnerLong.fromNumber(val))
    }
}
