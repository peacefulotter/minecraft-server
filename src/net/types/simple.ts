import * as NBT from 'nbtify'
import { PacketBuffer } from '~/net/PacketBuffer'
import { type InnerReadType, type Type } from '.'
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
    implements Type<NBT.NBTData, string | NBT.NBTData | ArrayBuffer | Buffer>
{
    async read(buffer: PacketBuffer) {
        const sub = buffer.readRest()
        const nbt = await NBT.read(sub)
        return new NBT.NBTData(nbt, { rootName: null })
    }

    async getBuffer(t: NBT.NBTData | ArrayBuffer | Buffer) {
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

    async write(t: string | NBT.NBTData | ArrayBuffer | Buffer) {
        if (typeof t === 'string') {
            const buf = new PacketBuffer(Buffer.from(t, 'utf-8'))
            const len = await new DataShort().write(buf.length)
            return PacketBuffer.concat([len, buf])
        }
        const buf = await this.getBuffer(t)
        return PacketBuffer.from(buf)
    }
}
