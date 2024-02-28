import { PacketBuffer } from '~/net/PacketBuffer'
import {
    BYTE_SIZE,
    DOUBLE_SIZE,
    FLOAT_SIZE,
    INT_SIZE,
    SHORT_SIZE,
    type Type,
} from '.'

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

class _DataByte extends Simple<number> {
    constructor() {
        super(BYTE_SIZE, 'readByte', 'writeByte')
    }
}

class _DataUnsignedByte extends Simple<number> {
    constructor() {
        super(BYTE_SIZE, 'readUnsignedByte', 'writeUnsignedByte')
    }
}

class _DataShort extends Simple<number> {
    constructor() {
        super(SHORT_SIZE, 'readShort', 'writeShort')
    }
}

class _DataUnsignedShort extends Simple<number> {
    constructor() {
        super(SHORT_SIZE, 'readUnsignedShort', 'writeUnsignedShort')
    }
}

class _DataInt extends Simple<number> {
    constructor() {
        super(INT_SIZE, 'readInt', 'writeInt')
    }
}

class _DataFloat extends Simple<number> {
    constructor() {
        super(FLOAT_SIZE, 'readFloat', 'writeFloat')
    }
}

class _DataDouble extends Simple<number> {
    constructor() {
        super(DOUBLE_SIZE, 'readDouble', 'writeDouble')
    }
}

export const DataByte = new _DataByte()
export const DataUnsignedByte = new _DataUnsignedByte()
export const DataShort = new _DataShort()
export const DataUnsignedShort = new _DataUnsignedShort()
export const DataInt = new _DataInt()
export const DataFloat = new _DataFloat()
export const DataDouble = new _DataDouble()
