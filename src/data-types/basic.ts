import Long from 'long'
import { CONTINUE_BIT, SEGMENT_BITS } from './constants'
import BitSet from 'bitset'

const FLOAT_SIZE = 4
const DOUBLE_SIZE = 8
const LONG_SIZE = 8
const UUID_SIZE = 16

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
    ...a: Parameters<T>
) => TNewReturn

export type Type<T> = {
    size?: number
    read: (buffer: number[], length?: number) => T
    write: (t: T) => Buffer
}

export type AsyncType<T> = Omit<Type<T>, 'read' | 'write'> & {
    read: ReplaceReturnType<
        Type<T>['read'],
        Promise<ReturnType<Type<T>['read']>>
    >
    write: ReplaceReturnType<
        Type<T>['write'],
        Promise<ReturnType<Type<T>['write']>>
    >
}

export const DataBoolean: Type<boolean> = {
    read: (buffer: number[]) => {
        return buffer.shift() === 1
    },
    write: (t: boolean) => {
        return Buffer.from([t ? 1 : 0])
    },
}

export const DataByte: Type<number> = {
    read: (buffer: number[]) => {
        return buffer.shift() as number
    },
    write: (t: number) => {
        return Buffer.from([t])
    },
}

export const DataByteArray: Type<Buffer> = {
    read: (buffer: number[], length?: number) => {
        const acc: number[] = []
        let i = 0
        while (length === undefined || i++ < length) {
            const element = DataByte.read(buffer)
            if (element === undefined) {
                if (length === undefined) break
                throw new Error('Buffer is too small')
            }
            acc.push(element)
        }
        return Buffer.from(acc)
    },
    write: (t: Buffer) => {
        return t
    },
}

export const DataShort: Type<number> = {
    read: (buffer: number[]) => {
        const b1 = DataByte.read(buffer)
        const b2 = DataByte.read(buffer)
        return (b1 << 8) | b2
    },
    write: (t: number) => {
        return Buffer.from([(t >> 8) & 0xffff, t & 0xffff])
    },
}

export const DataInt: Type<number> = {
    read: (buffer: number[]) => {
        const b1 = DataShort.read(buffer)
        const b2 = DataShort.read(buffer)
        return (b1 << 16) | b2
    },
    write: (t: number) => {
        return Buffer.concat([
            DataShort.write((t >> 16) & 0xffffffff),
            DataShort.write(t & 0xffffffff),
        ])
    },
}

export const DataLong: Type<Long> = {
    read: (buffer: number[]) => {
        const b1 = DataInt.read(buffer)
        const b2 = DataInt.read(buffer)
        return new Long(b1, b2)
    },
    write: (t: Long) => {
        return Buffer.concat([DataInt.write(t.high), DataInt.write(t.low)])
    },
}

export const DataFloat: Type<number> = {
    read: (buffer: number[]) => {
        return new DataView(
            DataByteArray.read(buffer, FLOAT_SIZE).buffer
        ).getFloat32(0)
    },
    write: (t: number) => {
        const buffer = new ArrayBuffer(FLOAT_SIZE)
        new DataView(buffer).setFloat32(0, t)
        return Buffer.from(buffer)
    },
}

export const DataDouble: Type<number> = {
    read: (buffer: number[]) => {
        return new DataView(
            DataByteArray.read(buffer, DOUBLE_SIZE).buffer
        ).getFloat64(0)
    },

    write: (t: number) => {
        const buffer = new ArrayBuffer(DOUBLE_SIZE)
        new DataView(buffer).setFloat64(0, t)
        return Buffer.from(buffer)
    },
}

export const DataUUID: Type<string> = {
    read: (buffer: number[]) => {
        return DataByteArray.read(buffer, UUID_SIZE).toString('hex')
    },
    write: (t: string) => {
        const buffer = Buffer.from(t.replaceAll('-', ''), 'hex')
        return buffer
    },
}

export const DataString: Type<string> = {
    read: (buffer: number[]) => {
        return VarIntPrefixedByteArray.read(buffer).toString('utf-8')
    },
    write: (t: string) => {
        const buffer = Buffer.from(t)
        return VarIntPrefixedByteArray.write(buffer)
    },
}

export const VarInt: Type<number> = {
    read: (buffer: number[]) => {
        let value = 0
        let position = 0
        let idx = 0

        while (true) {
            const byte = DataByte.read(buffer)

            value |= (byte & SEGMENT_BITS) << position

            if ((byte & CONTINUE_BIT) == 0) break

            position += 7
            idx++

            if (position >= 32) throw new Error('VarInt is too big')
        }

        return value
    },

    write: (t: number) => {
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
    },
}

export const VarLong: Type<Long> = {
    read: (buffer: number[]) => {
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
    },

    write: (t: Long) => {
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
    },
}

export const VarIntPrefixedByteArray: Type<Buffer> = {
    read: (buffer: number[]) => {
        const length = VarInt.read(buffer)
        return DataByteArray.read(buffer, length)
    },

    write: (t: Buffer) => {
        const length = t.length
        return Buffer.concat([VarInt.write(length), t])
    },
}

export const DataPosition: Type<{
    x: number
    y: number
    z: number
}> = {
    read: (buffer: number[]) => {
        const val = DataLong.read(buffer).toNumber()
        const x = val >> 38
        const y = (val << 52) >> 52
        const z = (val << 26) >> 38
        return { x, y, z }
    },

    write: (t: { x: number; y: number; z: number }) => {
        const val =
            ((t.x & 0x3ffffff) << 38) |
            ((t.z & 0x3ffffff) << 12) |
            (t.y & 0xfff)
        return DataLong.write(Long.fromNumber(val))
    },
}

export const DataBitSet: Type<BitSet> = {
    read: (buffer: number[]) => {
        const nbLong = VarInt.read(buffer)
        if (nbLong === 0) return new BitSet(0)
        const length = Math.min(buffer.length, nbLong * LONG_SIZE)
        console.log(length, buffer.length, nbLong, buffer)
        const bits = DataByteArray.read(buffer, length)
        return new BitSet(bits)
    },
    write: (t: BitSet) => {
        if (t.toArray().length === 0) return Buffer.from([0])
        const buffer = Buffer.from(
            t
                .toString()
                .split('')
                .reverse()
                .join('')
                .match(/.{1,8}/g)
                ?.map((x) =>
                    parseInt(x.split('').reverse().join(''), 2)
                ) as number[]
        )
        const nbLongs = Math.ceil(buffer.length / LONG_SIZE)
        return Buffer.concat([VarInt.write(nbLongs), buffer])
    },
}

// ============= Meta types =============
export const DataOptional = <T>(
    type: Type<T> | AsyncType<T>
): AsyncType<T | undefined> => ({
    read: async (buffer: number[], length?: number) => {
        if (DataBoolean.read(buffer, length))
            return await type.read(buffer, length)
        return undefined
    },

    write: async (t: T | undefined) => {
        if (t === undefined) {
            return DataBoolean.write(false)
        }
        return Buffer.concat([DataBoolean.write(true), await type.write(t)])
    },
})

export const DataArray = <T>(type: Type<T> | AsyncType<T>) => ({
    read: async (buffer: number[]) => {
        const length = VarInt.read(buffer)
        const decoded = new Array(length).fill(0).map(() => type.read(buffer))
        return await Promise.all(decoded)
    },

    write: async (t: T[]) => {
        const length = VarInt.write(t.length)
        const encoded = await Promise.all(t.map((e) => type.write(e)))
        return Buffer.concat([length, ...encoded])
    },
})

type DataTypeObject = { [key: string]: Type<any> | AsyncType<any> }
export type ObjectResult<T extends DataTypeObject> = {
    [key in keyof T]: T[key] extends Type<infer U> | AsyncType<infer U>
        ? U
        : never
}

export const DataObject = <T extends DataTypeObject>(
    types: T
): AsyncType<ObjectResult<T>> => ({
    read: async (buffer: number[]) => {
        return Object.fromEntries(
            await Promise.all(
                Object.entries(types).map(async ([key, type]) => [
                    key,
                    await type.read(buffer),
                ])
            )
        ) as ObjectResult<T>
    },

    write: async (t: ObjectResult<T>) => {
        return Buffer.concat(
            await Promise.all(
                Object.entries(t).map(([key, value]) => types[key].write(value))
            )
        )
    },
})

export const DataPackedXZ: Type<{ x: number; z: number }> = {
    read: (buffer: number[]) => {
        const encoded = DataByte.read(buffer)
        const x = encoded >> 4
        const z = encoded & 15
        return { x, z }
    },

    write: (t: { x: number; z: number }) => {
        const encoded = ((t.x & 15) << 4) | (t.z & 15)
        return DataByte.write(encoded)
    },
}
