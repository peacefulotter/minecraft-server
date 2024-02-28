import { parseUUID, type UUID } from '@minecraft-js/uuid'
import * as NBT from 'nbtify'
import BitSet from 'bitset'
import Long from 'long'

import type { Vec3 } from 'vec3'
import v from 'vec3'

import { PacketBuffer } from '~/net/PacketBuffer'
import type { Type } from './types'
import {
    DataByte,
    DataFloat,
    DataUnsignedByte,
    FLOAT_SIZE,
    LONG_SIZE,
    UUID_SIZE,
} from './types'
import { VarInt } from './types/var'
import { DataOptional } from './types/meta'

class _DataBoolean implements Type<boolean> {
    private composite = DataUnsignedByte

    async read(buffer: PacketBuffer) {
        return (await this.composite.read(buffer)) === 1
    }

    async write(t: boolean) {
        return await this.composite.write(t ? 1 : 0)
    }
}

class _DataByteArray implements Type<Buffer, PacketBuffer> {
    async readWithLength(buffer: PacketBuffer, length: number) {
        return buffer.readSlice(length)
    }

    async read(buffer: PacketBuffer) {
        return buffer.readRest()
    }

    async write(t: PacketBuffer) {
        return t
    }
}

class _DataLong implements Type<Long> {
    async read(buffer: PacketBuffer) {
        const low = buffer.readInt()
        const high = buffer.readInt()
        return new Long(low, high)
    }

    async write(t: Long) {
        const buffer = PacketBuffer.allocUnsafe(LONG_SIZE)
        buffer.writeInt(t.low)
        buffer.writeInt(t.high)
        return buffer
    }
}

class _DataUUID implements Type<UUID> {
    async read(buffer: PacketBuffer) {
        const str = buffer.toString(true, 'hex', 0, UUID_SIZE)
        return parseUUID(str)
    }

    async write(t: UUID) {
        return PacketBuffer.fromString(t.toString(false), 'hex')
    }
}

class _DataString implements Type<string> {
    private composite = VarIntPrefixedByteArray
    async read(buffer: PacketBuffer) {
        const arr = await this.composite.read(buffer)
        return arr.toString('utf-8')
    }
    async write(t: string) {
        const buffer = PacketBuffer.fromString(t, 'utf-8')
        return this.composite.write(buffer)
    }
}

class _VarIntPrefixedByteArray implements Type<Buffer, PacketBuffer | Buffer> {
    async read(buffer: PacketBuffer) {
        const length = await VarInt.read(buffer)
        return await DataByteArray.readWithLength(buffer, length)
    }

    async write(t: PacketBuffer | Buffer) {
        const length = await VarInt.write(t.length)
        const buffer = t instanceof PacketBuffer ? t.buffer : t
        return PacketBuffer.concat([length.buffer, buffer])
    }
}

class _DataPosition implements Type<Vec3> {
    async read(buffer: PacketBuffer) {
        const long = await DataLong.read(buffer)
        const val = long.toNumber()
        const x = val >> 38
        const y = (val << 52) >> 52
        const z = (val << 26) >> 38
        return v(x, y, z)
    }

    async write(t: Vec3) {
        const val =
            ((t.x & 0x3ffffff) << 38) |
            ((t.z & 0x3ffffff) << 12) |
            (t.y & 0xfff)
        return DataLong.write(Long.fromNumber(val))
    }
}

const setBitSetBuffer = (t: BitSet, buffer: PacketBuffer) => {
    const arr = t.toArray()
    for (const bit of arr) {
        const idx = bit >> 3
        buffer.set(idx, buffer.get(idx, false) | (1 << (bit & 7)))
    }
}

export const DataBitSet: Type<BitSet> = {
    read: async (buffer: PacketBuffer) => {
        const nbLong = await VarInt.read(buffer)
        if (nbLong === 0) {
            return new BitSet(0)
        }
        const restLen = Math.min(buffer.length, nbLong * LONG_SIZE)
        const bits = await DataByteArray.readWithLength(buffer, restLen)
        return new BitSet(bits)
    },

    write: async (t: BitSet) => {
        const length = Math.ceil((t.msb() + 1) / 8)
        if (length === 0 || t.toArray().length === 0)
            return PacketBuffer.from([0])
        const buffer = PacketBuffer.allocUnsafe(length)
        setBitSetBuffer(t, buffer)
        const nbLongs = Math.ceil(buffer.length / LONG_SIZE)
        const size = await VarInt.write(nbLongs)
        return PacketBuffer.concat([size.buffer, buffer.buffer])
    },
}

export const DataFixedBitSet = (length: number): Type<BitSet> => ({
    read: async (buffer: PacketBuffer) => {
        const numBytes = Math.ceil(length / 8)
        const arr = await DataByteArray.readWithLength(buffer, numBytes)
        return new BitSet(arr)
    },
    write: async (t: BitSet) => {
        const numBytes = Math.ceil(length / 8)
        const buffer = PacketBuffer.alloc(numBytes)
        setBitSetBuffer(t, buffer)
        return buffer
    },
})

export const DataNBT: Type<
    NBT.NBTData<NBT.RootTagLike> | NBT.RootTagLike,
    NBT.NBTData<NBT.RootTagLike> | NBT.RootTagLike | PacketBuffer
> = class NBTCompoundTag {
    static read = async (buffer: PacketBuffer) => {
        const sub = buffer.readRest()
        return await NBT.read(sub)
    }

    static write = async (
        t: NBT.RootTagLike | NBT.NBTData<NBT.RootTagLike> | PacketBuffer
    ) => {
        if (t instanceof PacketBuffer) {
            return t
        }
        const buf = await NBT.write(t, { rootName: null })
        return PacketBuffer.from(buf)
    }
}

// ============= Meta types =============

export const DataVec3: Type<Vec3> = {
    read: async (buffer: PacketBuffer) => {
        const x = await DataFloat.read(buffer)
        const y = await DataFloat.read(buffer)
        const z = await DataFloat.read(buffer)
        return v(x, y, z)
    },

    write: async (t: Vec3) => {
        const buffer = PacketBuffer.allocUnsafe(3 * FLOAT_SIZE)
        buffer.writeFloat(t.x)
        buffer.writeFloat(t.y)
        buffer.writeFloat(t.z)
        return buffer
    },
}

export const DataPackedXZ: Type<{ x: number; z: number }> = {
    read: async (buffer: PacketBuffer) => {
        const encoded = await DataByte.read(buffer)
        const x = encoded >> 4
        const z = encoded & 15
        return { x, z }
    },

    write: async (t: { x: number; z: number }) => {
        const encoded = ((t.x & 15) << 4) | (t.z & 15)
        return await DataByte.write(encoded)
    },
}

// https://wiki.vg/Slot_Data
// Differs from the docs since the present field is taken care by DataOptional
export const DataSlot = DataOptional(
    new DataObject({
        itemId: VarInt,
        itemCount: DataByte,
        nbt: DataNBT,
    })
)

const DataBoolean = new _DataBoolean()
const DataByteArray = new _DataByteArray()
const DataLong = new _DataLong()
const DataUUID = new _DataUUID()
const DataString = new _DataString()
const VarIntPrefixedByteArray = new _VarIntPrefixedByteArray()
const DataPosition = new _DataPosition()
