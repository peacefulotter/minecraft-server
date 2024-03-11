import { PacketBuffer } from '~/net/PacketBuffer'
import {
    DataUnsignedByte,
    type Type,
    DataByteArray,
    DataFloat,
    DataByte,
} from '.'
import Long from 'long'
import { VarInt } from './var'
import type { Vec3 } from 'vec3'
import v from 'vec3'
import BitSet from 'bitset'
import { FLOAT_SIZE, LONG_SIZE } from './constants'

export class DataBoolean implements Type<boolean> {
    private composite = new DataUnsignedByte()

    async read(buffer: PacketBuffer) {
        return (await this.composite.read(buffer)) === 1
    }

    async write(t: boolean) {
        return await this.composite.write(t ? 1 : 0)
    }
}

export class DataLong implements Type<Long> {
    async read(buffer: PacketBuffer) {
        const high = buffer.readInt()
        const low = buffer.readInt()
        return new Long(low, high)
    }

    async write(t: Long) {
        const buffer = PacketBuffer.allocUnsafe(LONG_SIZE)
        buffer.writeInt(t.high)
        buffer.writeInt(t.low)
        return buffer
    }
}

export class DataString implements Type<string> {
    async read(buffer: PacketBuffer) {
        const length = await VarInt.read(buffer)
        return buffer.readString('utf-8', 0, length)
    }
    async write(t: string) {
        const bufStr = Buffer.from(t, 'utf-8')
        const length = await VarInt.write(bufStr.length)
        const buffer = Buffer.allocUnsafe(length.length + bufStr.length)
        length.buffer.copy(buffer)
        bufStr.copy(buffer, length.length)
        return new PacketBuffer(buffer)
    }
}

export class VarIntPrefixedByteArray
    implements Type<Buffer, PacketBuffer | Buffer>
{
    private composite = new DataByteArray()

    async read(buffer: PacketBuffer) {
        const length = await VarInt.read(buffer)
        return await this.composite.readWithLength(buffer, length)
    }

    async write(t: PacketBuffer | Buffer) {
        const length = await VarInt.write(t.length)
        const buffer = t instanceof PacketBuffer ? t.buffer : t
        return PacketBuffer.concat([length.buffer, buffer])
    }
}

export class DataPosition implements Type<Vec3> {
    private composite = new DataLong()

    async read(buffer: PacketBuffer) {
        const long = await this.composite.read(buffer)
        let x = long.shiftRight(38).toNumber()
        let y = long.shiftLeft(52).shiftRight(52).toNumber()
        let z = long.shiftLeft(26).shiftRight(38).toNumber()
        return v(x, y, z)
    }

    async write(t: Vec3) {
        const long = new Long(
            ((t.z & 0xfffff) << 12) | (t.y & 0xfff),
            ((t.x & 0x3ffffff) << 6) | (t.z & 0x3f00000)
        )
        return await this.composite.write(long)
    }
}

export class DataVec3 implements Type<Vec3> {
    private composite = new DataFloat()

    async read(buffer: PacketBuffer) {
        const x = await this.composite.read(buffer)
        const y = await this.composite.read(buffer)
        const z = await this.composite.read(buffer)
        return v(x, y, z)
    }

    async write(t: Vec3) {
        const buffer = PacketBuffer.allocUnsafe(3 * FLOAT_SIZE)
        buffer.writeFloat(t.x)
        buffer.writeFloat(t.y)
        buffer.writeFloat(t.z)
        return buffer
    }
}

export class DataPackedXZ implements Type<{ x: number; z: number }> {
    private composite = new DataUnsignedByte()

    async read(buffer: PacketBuffer) {
        const encoded = await this.composite.read(buffer)
        const x = encoded >> 4
        const z = encoded & 15
        return { x, z }
    }

    async write(t: { x: number; z: number }) {
        const encoded = ((t.x & 15) << 4) | (t.z & 15)
        return await this.composite.write(encoded)
    }
}

const setBitSetBuffer = (t: BitSet, buffer: PacketBuffer, offset: number) => {
    const arr = t.toArray()
    for (const bit of arr) {
        const idx = (bit >> 3) + offset
        buffer.set(idx, buffer.get(idx, false) | (1 << (bit & 7)))
    }
}

export class DataBitSet implements Type<BitSet> {
    private composite = new DataByteArray()

    async read(buffer: PacketBuffer) {
        const nbLong = await VarInt.read(buffer)
        if (nbLong === 0) {
            return new BitSet(0)
        }
        const restLen = Math.min(buffer.length, nbLong * LONG_SIZE)
        const bits = await this.composite.readWithLength(buffer, restLen)
        return new BitSet(bits)
    }

    async write(t: BitSet) {
        const length = Math.ceil((t.msb() + 1) / 8)
        if (length === 0 || t.toArray().length === 0)
            return PacketBuffer.from([0])
        // Encoded as longs so need to fill the empty space with 0
        const longLengthDelta = LONG_SIZE - (length % LONG_SIZE)
        const buffer = PacketBuffer.alloc(length + longLengthDelta)
        setBitSetBuffer(t, buffer, longLengthDelta)
        const nbLongs = Math.ceil(buffer.length / LONG_SIZE)
        const size = await VarInt.write(nbLongs)
        return PacketBuffer.concat([size.buffer, buffer.buffer])
    }
}

export class DataFixedBitSet implements Type<BitSet> {
    private readonly composite = new DataByteArray()
    constructor(private length: number) {}

    async read(buffer: PacketBuffer) {
        const arr = await this.composite.readWithLength(buffer, this.length)
        return new BitSet(arr)
    }

    async write(t: BitSet) {
        const buffer = PacketBuffer.alloc(this.length)
        setBitSetBuffer(t, buffer, 0)
        return buffer
    }
}
