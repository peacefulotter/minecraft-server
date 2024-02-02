import { describe, test, expect } from 'bun:test'
import Long from 'long'
import { createReadPacket, createWritePacket, formats } from '~/formats'

// const description = new Builder('text', string).next('color', int)
// const res = description.get([0, 1, 2])

describe('formats', () => {
    test('is identity when writing -> reading', () => {
        const writePacket = createWritePacket({
            a: formats.write.byte,
            lenB: formats.write.int,
            b: formats.write.bytes,
            c: formats.write.short,
            d: formats.write.int,
            lenE: formats.write.varint,
            e: formats.write.bytes,
            f: formats.write.varint,
            g: formats.write.varlong,
        })
        const readPacket = createReadPacket({
            a: formats.read.byte,
            lenB: formats.read.int,
            b: formats.read.bytes,
            c: formats.read.short,
            d: formats.read.int,
            lenE: formats.read.varint,
            e: formats.read.bytes,
            f: formats.read.varint,
            g: formats.read.varlong,
        })
        const b = [1, 2, 3]
        const e = 'hello world'
        const packet = {
            a: 42,
            lenB: b.length, // mc packets always specify length of following bytes array
            b: Buffer.from(b),
            c: 5,
            d: 6,
            lenE: e.length,
            e: Buffer.from(e),
            f: 255,
            g: new Long(16, 128),
        } as const
        const buffer = writePacket(packet)
        console.log(buffer)
        const data = buffer.toJSON().data

        const res = readPacket(data, false)
        expect(res).toEqual(packet)
    })
})
