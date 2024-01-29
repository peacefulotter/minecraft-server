import Long from 'long'

const SEGMENT_BITS = 0x7f
const CONTINUE_BIT = 0x80

export const readByte = (buffer: number[]) => {
    const byte = buffer.shift()
    if (byte === undefined) throw new Error('Buffer is empty')
    return byte
}

export const readBytes = (buffer: number[], n: number) => {
    const acc: number[] = []
    for (let i = 0; i < n; i++) {
        acc.push(readByte(buffer))
    }
    return Buffer.from(acc)
}

export const readShort = (buffer: number[]) => {
    const b1 = readByte(buffer)
    const b2 = readByte(buffer)
    return (b1 << 8) | b2
}

export const readInt = (buffer: number[]) => {
    const b1 = readShort(buffer)
    const b2 = readShort(buffer)
    return (b1 << 16) | (b2 << 16)
}

export const readString = (buffer: number[], n: number) => {
    const acc = []
    for (let i = 0; i < n; i++) {
        const element = readVarInt(buffer)
        if (element === 0) i--
        else acc.push(element)
    }
    return Buffer.from(acc).toString('utf-8')
}

export const readVarInt = (buffer: number[]) => {
    let value = 0
    let position = 0
    let idx = 0

    while (true) {
        const byte = readByte(buffer)

        value |= (byte & SEGMENT_BITS) << position

        if ((byte & CONTINUE_BIT) == 0) break

        position += 7
        idx++

        if (position >= 32) throw new Error('VarInt is too big')
    }

    return value
}

export const readVarLong = (buffer: Buffer) => {
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

export const writeVarInt = (value: number) => {
    const buffer = []
    while (true) {
        if ((value & ~SEGMENT_BITS) == 0) {
            buffer.push(value)
            break
        }

        buffer.push((value & SEGMENT_BITS) | CONTINUE_BIT)

        // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
        value >>>= 7
    }
    return Buffer.from(buffer)
}

export const writeVarLong = (value: Long) => {
    const buffer: number[] = []
    while (true) {
        if (value.and(~SEGMENT_BITS).eq(0)) {
            buffer.push(value.toNumber())
            break
        }

        buffer.push(value.and(SEGMENT_BITS).or(CONTINUE_BIT).toNumber())

        // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
        value.shiftRight(7)
    }
    return Buffer.from(buffer)
}
