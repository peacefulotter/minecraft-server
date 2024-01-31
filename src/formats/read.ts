import Long from 'long'

const SEGMENT_BITS = 0x7f
const CONTINUE_BIT = 0x80

type Args = { buffer: number[] }
type ArgsWithLength = Args & { length: number }

const readByte = ({ buffer }: Args) => {
    const byte = buffer.shift()
    if (byte === undefined) throw new Error('Buffer is empty')
    return byte
}

const readBytes = ({ buffer, length }: ArgsWithLength) => {
    const acc: number[] = []
    for (let i = 0; i < length; i++) {
        acc.push(readByte({ buffer }))
    }
    return Buffer.from(acc)
}

const readShort = ({ buffer }: Args) => {
    const b1 = readByte({ buffer })
    const b2 = readByte({ buffer })
    return (b1 << 8) | b2
}

const readInt = ({ buffer }: Args) => {
    const b1 = readShort({ buffer })
    const b2 = readShort({ buffer })
    return (b1 << 16) | (b2 << 16)
}

const readString = ({ buffer, length }: ArgsWithLength) => {
    const acc = []
    for (let i = 0; i < length; i++) {
        const element = readVarInt({ buffer })
        if (element === 0) i--
        else acc.push(element)
    }
    return Buffer.from(acc).toString('utf-8')
}

const readVarInt = ({ buffer }: Args) => {
    let value = 0
    let position = 0
    let idx = 0

    while (true) {
        const byte = readByte({ buffer })

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
        value = value.or((currentByte & SEGMENT_BITS) << position)

        if ((currentByte & CONTINUE_BIT) == 0) break

        position += 7
        idx++

        if (position >= 64) throw new Error('VarLong is too big')
    }

    return value
}

const builder =
    <F extends (args: ArgsWithLength) => any>(func: F) =>
    (args: ArgsWithLength) =>
        func(args) as ReturnType<F>

const string = builder(readString)
const int = builder(readInt)

type BuilderType<
    K extends string | undefined,
    V extends (args: ArgsWithLength) => any,
    O extends {}
> = K extends string
    ? O extends Record<infer K_, infer V_>
        ? Record<K_, V_> & { [key in K]: V }
        : never
    : {}

class Builder<K extends string | undefined, V extends (args: ArgsWithLength) => any, O extends {}> {
    data: BuilderType<K, V, O>
    constructor(name: K, value: V, acc?: O) {
        if (name === undefined) this.data = acc as BuilderType<K, V, O>
        else this.data = { ...acc, [name]: value } as BuilderType<K, V, O>
    }

    next = <K_ extends string, V_ extends (args: ArgsWithLength) => any>(
        name: K_,
        value: V_
    ): Builder<K_, V_, BuilderType<K, V, O>> => {
        return new Builder(name, value, this.data)
    }

    get = (buffer: number[]) => {
        let length = 0
        const res: any = {}
        for (const [k, v] of Object.entries(this.data)) {
            res[k] = v({ buffer, length: readVarInt({ buffer }) })
        }
        return res as Aim<BuilderType<K, V, O>>
    }
}

type FromEntries<A> = A extends { [K: PropertyKey]: Function }
    ? {
          [K in keyof A]: A[K] extends (...args: any[]) => infer R ? R : never
      }
    : never
type Pure<T> = { [K in keyof T]: T[K] } & unknown
type Aim<T> = Pure<FromEntries<T>>

const description = new Builder('text', string).next('color', int)
const data = description.data
const res = description.get([0, 1, 2])

export const formatting = {
    string: factory(readString),
}

const test = formatting.string('here')
