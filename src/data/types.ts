import { parseUUID, type UUID } from '@minecraft-js/uuid'
import * as NBT from 'nbtify'
import BitSet from 'bitset'
import Long from 'long'

import type { Vec3 } from 'vec3'
import v from 'vec3'

import type { PacketArguments, PacketFormat } from '~/net/packets/create'
import { CONTINUE_BIT, SEGMENT_BITS } from './constants'
import { decode, encode } from 'leb128/unsigned'

const SHORT_SIZE = 2
const INT_SIZE = 4
const FLOAT_SIZE = 4
const DOUBLE_SIZE = 8
const LONG_SIZE = 8
const UUID_SIZE = 16

export type Type<R, W = R> = {
    read: (buffer: Buffer, offset: number) => Promise<{ t: R; length: number }>
    write: (t: W) => Promise<Buffer>
}

export type InnerWriteType<T extends Type<any>> = T extends Type<any, infer U>
    ? U
    : never

export type InnerReadType<T extends Type<any>> = T extends Type<infer U, any>
    ? U
    : never

export const DataByte: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readInt8(offset), length: 1 }
    },
    write: async (t: number) => {
        return Buffer.from([t])
    },
}

export const DataUnsignedByte: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readUInt8(offset), length: 1 }
    },
    write: async (t: number) => {
        return Buffer.from([t])
    },
}

export const DataBoolean: Type<boolean> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readUInt8(offset) === 1, length: 1 }
    },
    write: async (t: boolean) => {
        return DataByte.write(t ? 1 : 0)
    },
}

export const DataAngle = DataByte

export const DataByteArray = (length?: number): Type<Buffer> => ({
    read: async (buffer: Buffer, offset: number) => {
        const res =
            length === undefined
                ? buffer.subarray(offset)
                : buffer.subarray(offset, offset + length)
        return { t: res, length: res.length }
    },
    write: async (t: Buffer) => {
        return t
    },
})

export const DataShort: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readInt16BE(offset), length: SHORT_SIZE }
    },
    write: async (t: number) => {
        const buffer = Buffer.allocUnsafe(SHORT_SIZE)
        buffer.writeInt16BE(t)
        return buffer
    },
}

export const DataUnsignedShort: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readUInt16BE(offset), length: SHORT_SIZE }
    },
    write: async (t: number) => {
        const buffer = Buffer.allocUnsafe(SHORT_SIZE)
        buffer.writeUInt16BE(t)
        return buffer
    },
}

export const DataInt: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readInt32BE(offset), length: INT_SIZE }
    },
    write: async (t: number) => {
        const buffer = Buffer.allocUnsafe(INT_SIZE)
        buffer.writeInt32BE(t)
        return buffer
    },
}

export const DataLong: Type<Long> = {
    read: async (buffer: Buffer, offset: number) => {
        const low = buffer.readInt32BE(offset)
        const high = buffer.readInt32BE(offset + INT_SIZE)
        return {
            t: new Long(low, high),
            length: LONG_SIZE,
        }
    },
    write: async (t: Long) => {
        const buffer = Buffer.allocUnsafe(LONG_SIZE)
        buffer.writeInt32BE(t.low)
        buffer.writeInt32BE(t.high, INT_SIZE)
        return buffer
    },
}

export const DataFloat: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readFloatBE(offset), length: FLOAT_SIZE }
    },
    write: async (t: number) => {
        const buffer = Buffer.allocUnsafe(FLOAT_SIZE)
        buffer.writeFloatBE(t)
        return buffer
    },
}

export const DataDouble: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        return { t: buffer.readDoubleBE(offset), length: DOUBLE_SIZE }
    },

    write: async (t: number) => {
        const buffer = Buffer.allocUnsafe(DOUBLE_SIZE)
        buffer.writeDoubleBE(t)
        return buffer
    },
}

export const DataUUID: Type<UUID> = {
    read: async (buffer: Buffer, offset: number) => {
        const str = buffer.toString('hex', offset, offset + UUID_SIZE)
        const uuid = parseUUID(str)
        return { t: uuid, length: UUID_SIZE }
    },
    write: async (t: UUID) => {
        return Buffer.from(t.toString(false), 'hex')
    },
}

export const DataString: Type<string> = {
    read: async (buffer: Buffer, offset: number) => {
        const { t, length } = await VarIntPrefixedByteArray.read(buffer, offset)
        return { t: t.toString('utf-8'), length }
    },
    write: async (t: string) => {
        const buffer = Buffer.from(t, 'utf-8')
        return VarIntPrefixedByteArray.write(buffer)
    },
}

export const VarInt: Type<number> = {
    read: async (buffer: Buffer, offset: number) => {
        let value = 0
        let position = 0
        let length = 0

        while (true) {
            const { t: byte } = await DataByte.read(buffer, offset + length)
            length++

            value |= (byte & SEGMENT_BITS) << position

            if ((byte & CONTINUE_BIT) == 0) break

            position += 7

            if (position >= 32) throw new Error('VarInt is too big')
        }

        return { t: value, length }
    },

    write: async (t: number) => {
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

// TODO: /!\ Fix issue with negative longs
export const VarLong: Type<Long> = {
    read: async (buffer: Buffer, offset: number) => {
        let value = new Long(0, 0)
        let position = 0
        let length = 0

        while (true) {
            const { t: byte } = await DataByte.read(buffer, offset + length)
            length++

            value = value.or(new Long(byte & SEGMENT_BITS).shiftLeft(position))

            if ((byte & CONTINUE_BIT) == 0) break

            position += 7

            if (position >= 64) throw new Error('VarLong is too big')
        }

        return { t: value, length }
    },

    write: async (t: Long) => {
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
    read: async (buffer: Buffer, offset: number) => {
        const { t, length } = await VarInt.read(buffer, offset)
        const { t: arr, length: arrLength } = await DataByteArray(t).read(
            buffer,
            offset + length
        )
        return { t: arr, length: length + arrLength }
    },

    write: async (t: Buffer) => {
        const length = t.length
        return Buffer.concat([await VarInt.write(length), t])
    },
}

export const DataPosition: Type<Vec3> = {
    read: async (buffer: Buffer, offset: number) => {
        const { t: long, length } = await DataLong.read(buffer, offset)
        const val = long.toNumber()
        const x = val >> 38
        const y = (val << 52) >> 52
        const z = (val << 26) >> 38
        return { t: v(x, y, z), length }
    },

    write: async (t: Vec3) => {
        const val =
            ((t.x & 0x3ffffff) << 38) |
            ((t.z & 0x3ffffff) << 12) |
            (t.y & 0xfff)
        return DataLong.write(Long.fromNumber(val))
    },
}

const setBitSetBuffer = (t: BitSet, buffer: Buffer) => {
    const arr = t.toArray()
    for (const bit of arr) {
        buffer[bit >> 3] |= 1 << (bit & 7)
    }
}

export const DataBitSet: Type<BitSet> = {
    read: async (buffer: Buffer, offset: number) => {
        const { t: nbLong, length: viLen } = await VarInt.read(buffer, offset)
        if (nbLong === 0) {
            return { t: new BitSet(0), length: viLen }
        }
        const restLen = Math.min(buffer.length, nbLong * LONG_SIZE)
        const { t: bits, length: arrLen } = await DataByteArray(restLen).read(
            buffer,
            offset + viLen
        )
        return { t: new BitSet(bits), length: viLen + arrLen }
    },

    write: async (t: BitSet) => {
        const length = Math.ceil((t.msb() + 1) / 8)
        if (length === 0 || t.toArray().length === 0) return Buffer.from([0])
        const buffer = Buffer.allocUnsafe(length)
        setBitSetBuffer(t, buffer)
        const nbLongs = Math.ceil(buffer.length / LONG_SIZE)
        return Buffer.concat([await VarInt.write(nbLongs), buffer])
    },
}

export const DataFixedBitSet = (length: number): Type<BitSet> => ({
    read: async (buffer: Buffer, offset: number) => {
        const numBytes = Math.ceil(length / 8)
        const arr = await DataByteArray(numBytes).read(buffer, offset)
        return { t: new BitSet(arr.t), length: arr.length }
    },
    write: async (t: BitSet) => {
        const numBytes = Math.ceil(length / 8)
        const buffer = Buffer.alloc(numBytes)
        setBitSetBuffer(t, buffer)
        return buffer
    },
})

export const DataNBT: Type<
    NBT.NBTData<NBT.RootTagLike>,
    any
> = class NBTCompoundTag {
    static read = async (buffer: Buffer, offset: number) => {
        return {
            t: await NBT.read(buffer.subarray(offset)),
            length: buffer.length - offset,
        }
    }

    static write = async (
        t: NBT.RootTagLike | NBT.NBTData<NBT.RootTagLike> | Buffer | ArrayBuffer
    ) => {
        if (t instanceof Buffer) {
            return t
        } else if (t instanceof ArrayBuffer) {
            return Buffer.from(t)
        }

        const buf = await NBT.write(t, { rootName: null })
        return Buffer.from(buf)
    }
}

// ============= Meta types =============
export const DataOptional = <T>(type: Type<T>): Type<T | undefined> => ({
    read: async (buffer: Buffer, offset: number) => {
        const { t: isPresent, length } = await DataBoolean.read(buffer, offset)
        if (isPresent) {
            const { t: value, length: valueLength } = await type.read(
                buffer,
                offset + length
            )
            return { t: value, length: length + valueLength }
        }
        return { t: undefined, length }
    },

    write: async (t: T | undefined) => {
        if (t === undefined) {
            return await DataBoolean.write(false)
        }
        return Buffer.concat([
            await DataBoolean.write(true),
            await type.write(t),
        ])
    },
})

export const DataArray = <T>(type: Type<T>) => ({
    read: async (buffer: Buffer, offset: number) => {
        const { t: size, length } = await VarInt.read(buffer, offset)
        const arr: T[] = new Array(size)
        let arrLength = 0
        for (let i = 0; i < size; i++) {
            const { t: elt, length: eltLen } = await type.read(
                buffer,
                offset + length + arrLength
            )
            arr[i] = elt
            arrLength += eltLen
        }
        return { t: arr, length: length + arrLength }
    },

    write: async (ts: T[]) => {
        const length = await VarInt.write(ts.length)
        const arr = new Array(ts.length)
        for (let i = 0; i < ts.length; i++) {
            const elt = await type.write(ts[i])
            arr[i] = elt
        }
        return Buffer.concat([length, ...arr])
    },
})

export const DataObject = <T extends PacketFormat>(
    types: T
): Type<PacketArguments<T>> => ({
    read: async (buffer: Buffer, offset: number) => {
        const obj = {} as PacketArguments<T>
        let objLen = 0
        for (const [key, type] of Object.entries(types)) {
            const { t, length } = await type.read(buffer, offset + objLen)
            obj[key as keyof typeof obj] = t
            objLen += length
        }
        return { t: obj, length: objLen }
    },

    write: async (t: PacketArguments<T>) => {
        let buffers = [] as Buffer[]
        for (const [key, type] of Object.entries(types)) {
            const elt = await type.write(t[key as keyof typeof t])
            buffers.push(elt)
        }
        return Buffer.concat(buffers)
    },
})

// Make it possible to send a packet with optional fields (?)
// Using a mask to know which fields are present
// need to consider if this is worth implementing

// export const DataObjectOptional = <T extends PacketFormat>(
//     types: T,
//     masks: Record<keyof T, number>
// ): Type<PacketArguments<T>> => ({
//     read: async (buffer: number[]) => {
//         const resolved = await Object.entries(types).reduce(
//             (acc, [key, type]) =>
//                 acc.then(async (acc) => {
//                     acc.push([key, await type.read(buffer)])
//                     return acc
//                 }),
//             Promise.resolve([] as [keyof T, Promise<any>][])
//         )
//         return Object.fromEntries(resolved) as PacketArguments<T>
//     },

//     write: async (t: PacketArguments<T>) => {
//         return await Object.entries(types).reduce(
//             (acc, [key, type]) =>
//                 acc.then(async (acc) =>
//                     Buffer.concat([acc, await type.write(t[key])])
//                 ),
//             Promise.resolve(Buffer.from([]))
//         )
//     },
// })

// TODO: remove if not used
export const DataWithDefault = <T>(
    type: Type<T>,
    defaultValue: T
): Type<T, T | undefined> => ({
    read: async (buffer: Buffer, offset: number) => {
        return await type.read(buffer, offset)
    },
    write: async (t?: T) => {
        const definedT = t === undefined ? defaultValue : t
        return await type.write(definedT)
    },
})

export const DataVec3: Type<Vec3> = {
    read: async (buffer: Buffer, offset: number) => {
        const { t: x, length: lenX } = await DataFloat.read(buffer, offset)
        const { t: y, length: lenY } = await DataFloat.read(
            buffer,
            offset + lenX
        )
        const { t: z, length: lenZ } = await DataFloat.read(
            buffer,
            offset + lenX + lenY
        )
        return { t: v(x, y, z), length: lenX + lenY + lenZ }
    },

    write: async (t: Vec3) => {
        const buffer = Buffer.allocUnsafe(3 * FLOAT_SIZE)
        buffer.writeFloatBE(t.x, 0)
        buffer.writeFloatBE(t.y, FLOAT_SIZE)
        buffer.writeFloatBE(t.z, 2 * FLOAT_SIZE)
        return buffer
    },
}

export const DataPackedXZ: Type<{ x: number; z: number }> = {
    read: async (buffer: Buffer, offset: number) => {
        const { t: encoded, length } = await DataByte.read(buffer, offset)
        const x = encoded >> 4
        const z = encoded & 15
        return { t: { x, z }, length }
    },

    write: async (t: { x: number; z: number }) => {
        const encoded = ((t.x & 15) << 4) | (t.z & 15)
        return await DataByte.write(encoded)
    },
}

// https://wiki.vg/Slot_Data
// Differs from the docs since the present field is taken care by DataOptional
export const DataSlot = DataOptional(
    DataObject({
        itemId: VarInt,
        itemCount: DataByte,
        nbt: DataNBT,
    })
)
