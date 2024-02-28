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

    toString(
        read: boolean,
        encoding?: BufferEncoding | undefined,
        start?: number,
        end?: number
    ) {
        const offset = read ? this.readOffset : this.writeOffset
        const realStart = start ? start + offset : offset
        const realEnd = end ? end + offset : this.buffer.length
        return this.buffer.toString(encoding, realStart, realEnd)
    }

    static allocUnsafe(size: number) {
        return new PacketBuffer(Buffer.allocUnsafe(size))
    }

    static alloc(size: number) {
        return new PacketBuffer(Buffer.alloc(size))
    }

    static concat(list: Buffer[] | PacketBuffer[], totalLength?: number) {
        const buffers =
            list[0] instanceof PacketBuffer
                ? (list as PacketBuffer[]).map((buf) => buf.buffer)
                : (list as Buffer[])
        return new PacketBuffer(Buffer.concat(buffers, totalLength))
    }

    get(index: number, read: boolean) {
        const offset = read ? this.readOffset : this.writeOffset
        return this.buffer[index + offset]
    }

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

    readUnsignedShort() {
        const val = this.buffer.readUInt16BE(this.readOffset)
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

    readSlice(length?: number) {
        const realEnd = length ? length + this.readOffset : this.buffer.length
        const buffer = this.buffer.subarray(this.readOffset, realEnd)
        this.readOffset += buffer.length
        return buffer
    }

    readRest() {
        this.readOffset = this.buffer.length
        return this.buffer
    }

    // ========================== WRITE ==========================

    set(index: number, val: number) {
        this.buffer[index + this.writeOffset] = val
    }

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

    writeUnsignedShort(val: number) {
        this.buffer.writeUInt16BE(val, this.writeOffset)
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
