import leb128 from 'leb128'
import Long from 'long'

import { CONTINUE_BIT, SEGMENT_BITS } from './constants'
import { decrypt } from '~/auth'

type Args = { buffer: number[]; length: number }

const readByte = ({ buffer }: Args) => {
    const byte = buffer.shift()
    if (byte === undefined) throw new Error('Buffer is empty')
    return byte
}

const readBytes = (args: Args) => {
    const { length } = args
    const acc: number[] = []
    for (let i = 0; i < length; i++) {
        acc.push(readByte(args))
    }
    return Buffer.from(acc)
}

const readShort = (args: Args) => {
    const b1 = readByte(args)
    const b2 = readByte(args)
    return (b1 << 8) | b2
}

const readInt = (args: Args) => {
    const b1 = readShort(args)
    const b2 = readShort(args)
    return (b1 << 16) | b2
}

const readString = (args: Args) => {
    const { length } = args
    const acc = []
    for (let i = 0; i < length; i++) {
        const element = readVarInt(args)
        if (element === 0) i--
        else acc.push(element)
    }
    return Buffer.from(acc).toString('utf-8')
}

const readVarInt = (args: Args) => {
    let value = 0
    let position = 0
    let idx = 0

    while (true) {
        const byte = readByte(args)

        value |= (byte & SEGMENT_BITS) << position

        if ((byte & CONTINUE_BIT) == 0) break

        position += 7
        idx++

        if (position >= 32) throw new Error('VarInt is too big')
    }

    return value
}

const readVarLong = ({ buffer }: Args) => {
    let value = new Long(0)
    let position = 0
    let idx = 0

    while (true) {
        const currentByte = buffer.at(idx)
        if (currentByte === undefined) throw new Error('VarLong is too big')
        value = value.or(new Long(currentByte & SEGMENT_BITS).shiftLeft(position))

        if ((currentByte & CONTINUE_BIT) == 0) break

        position += 7
        idx++

        if (position >= 64) throw new Error('VarLong is too big')
    }

    return value
}

type BuilderType<
    K extends string | undefined,
    V extends (args: Args) => any,
    O extends {}
> = K extends string
    ? O extends Record<infer K_, infer V_>
        ? Record<K_, V_> & { [key in K]: V }
        : never
    : {}

type FromEntries<A> = A extends { [K: PropertyKey]: Function }
    ? {
          [K in keyof A]: A[K] extends (...args: any[]) => infer R ? R : never
      }
    : never
type Pure<T> = { [K in keyof T]: T[K] } & unknown
type BuilderResult<T> = Pure<FromEntries<T>>

export class Builder<K extends string | undefined, V extends (args: Args) => any, O extends {}> {
    private data: BuilderType<K, V, O>
    constructor(name: K, value: V, acc?: O) {
        if (name === undefined) this.data = acc as BuilderType<K, V, O>
        else this.data = { ...acc, [name]: value } as BuilderType<K, V, O>
    }

    next = <K_ extends string, V_ extends (args: Args) => any>(
        name: K_,
        value: V_
    ): Builder<K_, V_, BuilderType<K, V, O>> => {
        return new Builder(name, value, this.data)
    }

    get = (buffer: number[]) => {
        let length = 0
        const res: any = {}
        for (const [k, v] of Object.entries(this.data)) {
            res[k] = v({ buffer, length: readVarInt({ buffer, length: 0 }) })
        }
        return res as BuilderResult<BuilderType<K, V, O>>
    }
}

type PacketCreation = { [key: string]: (arg: Args) => any }

type PacketReturn<T extends PacketCreation> = {
    [key in keyof T]: T[key] extends (arg: Args) => infer Ret ? Ret : never
}

type ReadPacketReduce<T extends PacketCreation> = { acc: PacketReturn<T>; prev: number }

export const createReadPacket = <T extends PacketCreation>(
    t: T
): ((buffer: number[], encripted: boolean) => PacketReturn<typeof t>) => {
    return (buf: number[], encripted: boolean) => {
        const buffer = encripted ? decrypt(buf) : buf
        const computed = Object.entries(t).reduce(
            ({ acc, prev }, [key, val]) => {
                const v = val({ buffer, length: prev })
                return { acc: { ...acc, [key]: v }, prev: v }
            },
            { acc: {}, prev: 0 } as ReadPacketReduce<T>
        )
        return computed.acc
    }
}

export const formatting = {
    byte: readByte,
    bytes: readBytes,
    short: readShort,
    int: readInt,
    string: readString,
    varint: readVarInt,
    varlong: readVarLong,
}
