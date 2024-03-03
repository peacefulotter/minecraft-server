import * as NBT from 'nbtify'
import { PacketBuffer } from '~/net/PacketBuffer'
import { type Type } from '.'
import {
    BYTE_SIZE,
    DOUBLE_SIZE,
    FLOAT_SIZE,
    INT_SIZE,
    SHORT_SIZE,
    UUID_SIZE,
} from './constants'
import { parseUUID, type UUID } from '@minecraft-js/uuid'

type ReadFuncs<R> = keyof {
    [key in keyof PacketBuffer as PacketBuffer[key] extends () => R
        ? key extends `read${infer T}`
            ? key
            : never
        : never]: never
}

type WriteFuncs<W> = keyof {
    [key in keyof PacketBuffer as PacketBuffer[key] extends (arg: W) => void
        ? key extends `write${infer T}`
            ? key
            : never
        : never]: never
}

abstract class Simple<R, W = R> implements Type<R, W> {
    constructor(
        public size: number,
        public readFunc: ReadFuncs<R>,
        private writeFunc: WriteFuncs<W>
    ) {}

    async read(buffer: PacketBuffer) {
        return buffer[this.readFunc]() as R
    }

    async write(t: W) {
        const buffer = PacketBuffer.allocUnsafe(this.size)
        ;(buffer[this.writeFunc] as (t: W) => void)(t)
        return buffer
    }
}

export class DataByte extends Simple<number> {
    constructor() {
        super(BYTE_SIZE, 'readByte', 'writeByte')
    }
}

export class DataUnsignedByte extends Simple<number> {
    constructor() {
        super(BYTE_SIZE, 'readUnsignedByte', 'writeUnsignedByte')
    }
}

export class DataShort extends Simple<number> {
    constructor() {
        super(SHORT_SIZE, 'readShort', 'writeShort')
    }
}

export class DataUnsignedShort extends Simple<number> {
    constructor() {
        super(SHORT_SIZE, 'readUnsignedShort', 'writeUnsignedShort')
    }
}

export class DataInt extends Simple<number> {
    constructor() {
        super(INT_SIZE, 'readInt', 'writeInt')
    }
}

export class DataFloat extends Simple<number> {
    constructor() {
        super(FLOAT_SIZE, 'readFloat', 'writeFloat')
    }
}

export class DataDouble extends Simple<number> {
    constructor() {
        super(DOUBLE_SIZE, 'readDouble', 'writeDouble')
    }
}

export class DataByteArray implements Type<Buffer, PacketBuffer> {
    constructor(private length?: number) {}

    async readWithLength(buffer: PacketBuffer, length: number) {
        return buffer.readSlice(length)
    }

    async read(buffer: PacketBuffer) {
        if (this.length) {
            return this.readWithLength(buffer, this.length)
        }
        return buffer.readRest()
    }

    async write(t: PacketBuffer) {
        return t
    }
}

export class DataUUID implements Type<UUID> {
    async read(buffer: PacketBuffer) {
        const str = buffer.readString('hex', 0, UUID_SIZE)
        return parseUUID(str)
    }

    async write(t: UUID) {
        const str = t.toString(false)
        return PacketBuffer.fromString(str, 'hex')
    }
}

export class DataNBT
    implements
        Type<
            NBT.NBTData<NBT.RootTagLike>,
            NBT.NBTData<NBT.RootTagLike> | ArrayBuffer | Buffer
        >
{
    async read(buffer: PacketBuffer) {
        const sub = buffer.readRest()
        const nbt = await NBT.read(sub)
        return new NBT.NBTData(nbt, { rootName: null })
    }

    async getBuffer(t: NBT.NBTData<NBT.RootTagLike> | ArrayBuffer | Buffer) {
        if (t instanceof ArrayBuffer || t instanceof Buffer) {
            const buf = t instanceof ArrayBuffer ? Buffer.from(t) : t
            if (buf[1] == 0 && buf[2] == 0) {
                const noRoot = Buffer.alloc(buf.length - 2)
                noRoot.writeInt8(buf[0], 0)
                buf.copy(noRoot, 1, 3)
                return noRoot
            }
            return buf
        }
        return await NBT.write(t, { rootName: null })
    }

    async write(t: NBT.NBTData<NBT.RootTagLike> | ArrayBuffer | Buffer) {
        const buf = await this.getBuffer(t)
        return PacketBuffer.from(buf)
    }
}

// const a = [
//     10, 10, 0, 22, 109, 105, 110, 101, 99, 114, 97, 102, 116, 58, 116, 114, 105,
//     109, 95, 112, 97, 116, 116, 101, 114, 110, 8, 0, 4, 116, 121, 112, 101, 0,
//     22, 109, 105, 110, 101, 99, 114, 97, 102, 116, 58, 116, 114, 105, 109, 95,
//     112, 97, 116, 116, 101, 114, 110, 9, 0, 5, 118, 97, 108, 117, 101, 10, 0, 0,
//     0, 16, 8, 0, 4, 110, 97, 109, 101, 0, 15, 109, 105, 110, 101, 99, 114, 97,
//     102, 116, 58, 99, 111, 97, 115, 116, 3, 0, 2, 105, 100, 0, 0, 0, 0, 10, 0,
//     7, 101, 108, 101, 109, 101, 110, 116, 8, 0, 13, 116, 101, 109, 112, 108, 97,
//     116, 101, 95, 105, 116, 101, 109, 0, 44, 109, 105, 110, 101, 99, 114, 97,
//     102, 116, 58, 99, 111, 97, 115, 116, 95, 97, 114, 109, 111, 114, 95, 116,
//     114, 105, 109, 95, 115, 109, 105, 116, 104, 105, 110, 103, 95, 116, 101,
//     109, 112, 108, 97, 116, 101, 10, 0, 11, 100, 101, 115, 99, 114, 105, 112,
//     116, 105, 111, 110, 8, 0, 9, 116, 114, 97, 110, 115, 108, 97, 116, 101, 0,
//     28, 116, 114, 105, 109, 95, 112, 97, 116, 116, 101, 114, 110, 46, 109, 105,
//     110, 101, 99, 114, 97, 102, 116, 46, 99, 111, 97, 115, 116, 0, 8, 0, 8, 97,
//     115, 115, 101, 116, 95, 105, 100, 0, 15, 109, 105, 110, 101, 99, 114, 97,
//     102, 116, 58, 99, 111, 97, 115, 116, 1, 0, 5, 100, 101, 99, 97, 108, 0, 0,
//     0, 8, 0, 4, 110, 97, 109, 101, 0, 14, 109, 105, 110, 101, 99, 114, 97, 102,
//     116, 58, 100, 117, 110, 101, 3, 0, 2, 105, 100, 0, 0, 0, 1, 10, 0, 7, 101,
//     108, 101, 109, 101, 110, 116, 8, 0, 13, 116, 101, 109, 112, 108, 97, 116,
//     101, 95, 105, 116, 101, 109, 0, 43, 109, 105, 110, 101, 99, 114, 97, 102,
//     116, 58, 100, 117, 110, 101, 95, 97, 114, 109, 111, 114, 95, 116, 114, 105,
//     109, 95, 115, 109, 105, 116, 104, 105, 110, 103, 95, 116, 101, 109, 112,
//     108, 97, 116, 101, 10, 0, 11, 100, 101, 115, 99, 114, 105, 112, 116, 105,
//     111, 110, 8, 0, 9, 116, 114, 97, 110, 115, 108, 97, 116, 101, 0, 27, 116,
//     114, 105, 109, 95, 112, 97, 116, 116, 101, 114, 110, 46, 109, 105, 110, 101,
//     99, 114, 97, 102, 116, 46, 100, 117, 110, 101, 0, 8, 0, 8, 97, 115, 115,
//     101, 116, 95, 105, 100, 0, 14, 109, 105, 110, 101, 99, 114, 97, 102, 116,
//     58, 100, 117, 110, 101, 1, 0, 5, 100, 101, 99, 97, 108, 0, 0, 0, 8, 0, 4,
//     110, 97, 109, 101, 0, 13, 109, 105, 110, 101, 99, 114, 97, 102, 116, 58,
//     101, 121, 101, 3, 0, 2, 105, 100, 0, 0, 0, 2, 10, 0, 7, 101, 108, 101, 109,
//     101, 110, 116, 8, 0, 13, 116,
// ]

// // NEW version
// const b = [
//     10,` 0, 0,`, 10, 0, 22, 109, 105, 110, 101, 99, 114, 97, 102, 116, 58, 116,
//     114, 105, 109, 95, 112, 97, 116, 116, 101, 114, 110, 8, 0, 4, 116, 121, 112,
//     101, 0, 22, 109, 105, 110, 101, 99, 114, 97, 102, 116, 58, 116, 114, 105,
//     109, 95, 112, 97, 116, 116, 101, 114, 110, 9, 0, 5, 118, 97, 108, 117, 101,
//     10, 0, 0, 0, 16, 8, 0, 4, 110, 97, 109, 101, 0, 15, 109, 105, 110, 101, 99,
//     114, 97, 102, 116, 58, 99, 111, 97, 115, 116, 3, 0, 2, 105, 100, 0, 0, 0, 0,
//     10, 0, 7, 101, 108, 101, 109, 101, 110, 116, 8, 0, 13, 116, 101, 109, 112,
//     108, 97, 116, 101, 95, 105, 116, 101, 109, 0, 44, 109, 105, 110, 101, 99,
//     114, 97, 102, 116, 58, 99, 111, 97, 115, 116, 95, 97, 114, 109, 111, 114,
//     95, 116, 114, 105, 109, 95, 115, 109, 105, 116, 104, 105, 110, 103, 95, 116,
//     101, 109, 112, 108, 97, 116, 101, 10, 0, 11, 100, 101, 115, 99, 114, 105,
//     112, 116, 105, 111, 110, 8, 0, 9, 116, 114, 97, 110, 115, 108, 97, 116, 101,
//     0, 28, 116, 114, 105, 109, 95, 112, 97, 116, 116, 101, 114, 110, 46, 109,
//     105, 110, 101, 99, 114, 97, 102, 116, 46, 99, 111, 97, 115, 116, 0, 8, 0, 8,
//     97, 115, 115, 101, 116, 95, 105, 100, 0, 15, 109, 105, 110, 101, 99, 114,
//     97, 102, 116, 58, 99, 111, 97, 115, 116, 1, 0, 5, 100, 101, 99, 97, 108, 0,
//     0, 0, 8, 0, 4, 110, 97, 109, 101, 0, 14, 109, 105, 110, 101, 99, 114, 97,
//     102, 116, 58, 100, 117, 110, 101, 3, 0, 2, 105, 100, 0, 0, 0, 1, 10, 0, 7,
//     101, 108, 101, 109, 101, 110, 116, 8, 0, 13, 116, 101, 109, 112, 108, 97,
//     116, 101, 95, 105, 116, 101, 109, 0, 43, 109, 105, 110, 101, 99, 114, 97,
//     102, 116, 58, 100, 117, 110, 101, 95, 97, 114, 109, 111, 114, 95, 116, 114,
//     105, 109, 95, 115, 109, 105, 116, 104, 105, 110, 103, 95, 116, 101, 109,
//     112, 108, 97, 116, 101, 10, 0, 11, 100, 101, 115, 99, 114, 105, 112, 116,
//     105, 111, 110, 8, 0, 9, 116, 114, 97, 110, 115, 108, 97, 116, 101, 0, 27,
//     116, 114, 105, 109, 95, 112, 97, 116, 116, 101, 114, 110, 46, 109, 105, 110,
//     101, 99, 114, 97, 102, 116, 46, 100, 117, 110, 101, 0, 8, 0, 8, 97, 115,
//     115, 101, 116, 95, 105, 100, 0, 14, 109, 105, 110, 101, 99, 114, 97, 102,
//     116, 58, 100, 117, 110, 101, 1, 0, 5, 100, 101, 99, 97, 108, 0, 0, 0, 8, 0,
//     4, 110, 97, 109, 101, 0, 13, 109, 105, 110, 101, 99, 114, 97, 102, 116, 58,
//     101, 121, 101, 3, 0, 2, 105, 100, 0, 0, 0, 2, 10, 0, 7, 101, 108, 101, 109,
//     101, 110, 116, 8, 0,
// ]
