import {
    BYTE_SIZE,
    DOUBLE_SIZE,
    FLOAT_SIZE,
    INT_SIZE,
    LONG_SIZE,
    SHORT_SIZE,
} from '~/data/types'

export class PacketBuffer {
    readOffset = 0
    writeOffset = 0
    constructor(public buffer: Buffer) {}

    get(index: number) {
        return this.buffer[index]
    }

    get length() {
        return this.buffer.length
    }

    public static from(data: Uint8Array | readonly number[]): PacketBuffer
    public static from(
        data: WithImplicitCoercion<string | Uint8Array | readonly number[]>
    ): PacketBuffer
    static from(
        data:
            | Uint8Array
            | readonly number[]
            | WithImplicitCoercion<string | Uint8Array | readonly number[]>
    ): PacketBuffer {
        return new PacketBuffer(Buffer.from(data))
    }

    public static fromString(
        str:
            | WithImplicitCoercion<string>
            | {
                  [Symbol.toPrimitive](hint: 'string'): string
              },
        encoding?: BufferEncoding | undefined
    ): PacketBuffer
    static fromString(
        str:
            | WithImplicitCoercion<string>
            | {
                  [Symbol.toPrimitive](hint: 'string'): string
              },
        encoding?: BufferEncoding | undefined
    ) {
        return new PacketBuffer(Buffer.from(str, encoding))
    }

    subarray(start: number, end?: number) {
        const buf = this.buffer.subarray(start, end)
        return new PacketBuffer(buf)
    }

    // allocUnsafe

    // ========================== READ ==========================

    readDouble() {
        const val = this.buffer.readDoubleBE(this.readOffset)
        this.readOffset += DOUBLE_SIZE
        return val
    }

    readFloat() {
        const val = this.buffer.readFloatBE(this.readOffset)
        this.readOffset += FLOAT_SIZE
        return val
    }

    readInt() {
        const val = this.buffer.readInt32BE(this.readOffset)
        this.readOffset += INT_SIZE
        return val
    }

    readShort() {
        const val = this.buffer.readInt16BE(this.readOffset)
        this.readOffset += SHORT_SIZE
        return val
    }

    readByte() {
        const val = this.buffer.readInt8(this.readOffset)
        this.readOffset += BYTE_SIZE
        return val
    }

    readUnsignedByte() {
        const val = this.buffer.readUInt8(this.readOffset)
        this.readOffset += BYTE_SIZE
        return val
    }

    readLong() {
        const val = this.buffer.readBigInt64BE(this.readOffset)
        this.readOffset += LONG_SIZE
        return val
    }

    // ========================== WRITE ==========================

    writeDouble(val: number) {
        this.buffer.writeDoubleBE(val, this.writeOffset)
        this.writeOffset += DOUBLE_SIZE
    }

    writeFloat(val: number) {
        this.buffer.writeFloatBE(val, this.writeOffset)
        this.writeOffset += FLOAT_SIZE
    }

    writeInt(val: number) {
        this.buffer.writeInt32BE(val, this.writeOffset)
        this.writeOffset += INT_SIZE
    }

    writeShort(val: number) {
        this.buffer.writeInt16BE(val, this.writeOffset)
        this.writeOffset += SHORT_SIZE
    }

    writeByte(val: number) {
        this.buffer.writeInt8(val, this.writeOffset)
        this.writeOffset += BYTE_SIZE
    }

    writeUnsignedByte(val: number) {
        this.buffer.writeUInt8(val, this.writeOffset)
        this.writeOffset += BYTE_SIZE
    }

    writeLong(val: bigint) {
        this.buffer.writeBigInt64BE(val, this.writeOffset)
        this.writeOffset += LONG_SIZE
    }
}
