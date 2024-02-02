import Long from 'long'
import leb128 from 'leb128'
import { CONTINUE_BIT, SEGMENT_BITS } from './constants'

const writeByte = (value: number) => Buffer.from([value])
const writeBytes = (value: Buffer) => value

const writeString = (value: string) => {
    throw new Error('not implemented as per mc protocol')
    return Buffer.from(value)
}

const writeShort = (value: number) => {
    return Buffer.from([(value >> 8) & 0xffff, value & 0xffff])
}

const writeInt = (value: number) => {
    return Buffer.concat([writeShort((value >> 16) & 0xffffffff), writeShort(value & 0xffffffff)])
}

const writeVarInt = (value: number) => {
    const buffer = []
    while (true) {
        if ((value & ~SEGMENT_BITS) == 0) {
            buffer.push(value)
            break
        }

        buffer.push((value & SEGMENT_BITS) | CONTINUE_BIT)

        // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
        value = value >>> 7
    }
    return Buffer.from(buffer)
}

const writeVarLong = (value: Long) => {
    const buffer: number[] = []
    while (true) {
        console.log(
            value.and(~SEGMENT_BITS).toNumber(),
            value.and(~SEGMENT_BITS).eq(0),
            value.toNumber()
        )
        if (value.and(~SEGMENT_BITS).eq(0)) {
            buffer.push(value.toNumber())
            break
        }

        buffer.push(value.and(SEGMENT_BITS).or(CONTINUE_BIT).toNumber())

        // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
        value = value.shiftRight(7)
    }
    return Buffer.from(buffer)
}

type PacketCreation = { [key: string]: (arg: any) => Buffer }

type PacketArguments<T extends PacketCreation> = {
    [key in keyof T]: T[key] extends (arg: infer Arg) => Buffer ? Arg : never
}

export const createWritePacket = <T extends PacketCreation>(
    t: T
): ((args: PacketArguments<typeof t>) => Buffer) => {
    return (args: PacketArguments<typeof t>) =>
        Object.keys(t).reduce(
            (acc, key) => Buffer.concat([acc, t[key](args[key])]),
            Buffer.from([])
        )
}

export const formatting = {
    byte: writeByte,
    bytes: writeBytes,
    short: writeShort,
    int: writeInt,
    string: writeString,
    varint: writeVarInt,
    varlong: writeVarLong,
}
