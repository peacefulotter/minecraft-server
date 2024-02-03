import Long from 'long'
import { CONTINUE_BIT, SEGMENT_BITS } from './constants'

export interface Type<T> {
    read: (buffer: number[], length?: number) => T
    write: (t: T) => Buffer
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
            if (element === undefined) break
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

export const String: Type<string> = class String {
    static read = (buffer: number[]) => {
        const length = VarInt.read(buffer)
        const acc = []
        for (let i = 0; i < length; i++) {
            const element = VarInt.read(buffer)
            if (element === 0) i-- // TODO: test this???
            else acc.push(element)
        }
        return Buffer.from(acc).toString('utf-8')
    }

    static write = (t: string) => {
        const buffer = Buffer.from(t)
        const length = buffer.length
        return Buffer.concat([VarInt.write(length), buffer])
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

export const VarLong: Type<Long> = class VarLong {
    static read = (buffer: number[]) => {
        let value = new Long(0)
        let position = 0
        let idx = 0

        while (true) {
            const currentByte = buffer.at(idx)
            if (currentByte === undefined) throw new Error('VarLong is too big')
            value = value.or(
                new Long(currentByte & SEGMENT_BITS).shiftLeft(position)
            )

            if ((currentByte & CONTINUE_BIT) == 0) break

            position += 7
            idx++

            if (position >= 64) throw new Error('VarLong is too big')
        }

        return value
    }

    static write = (t: Long) => {
        const buffer: number[] = []
        while (true) {
            if (t.and(~SEGMENT_BITS).eq(0)) {
                buffer.push(t.toNumber())
                break
            }

            buffer.push(t.and(SEGMENT_BITS).or(CONTINUE_BIT).toNumber())

            // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
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
