import { describe, test, expect } from 'bun:test'
import Long from 'long'
import { createReadPacket, createWritePacket, format } from '~/formats'

// const description = new Builder('text', string).next('color', int)
// const res = description.get([0, 1, 2])

describe('formats', () => {
    test('is identity when writing -> reading', () => {
        const writePacket = createWritePacket({
            a: format.write.byte,
            lenB: format.write.byte,
            b: format.write.bytes,
            c: format.write.short,
            d: format.write.int,
            lenE: format.write.byte,
            e: format.write.bytes,
            // f: format.write.varint,
            // g: format.write.varlong,
        })
        const readPacket = createReadPacket({
            a: format.read.byte,
            lenB: format.read.byte, // len holds in one byte
            b: format.read.bytes,
            c: format.read.short,
            d: format.read.int,
            lenE: format.read.byte, // len holds in one byte
            e: format.read.bytes,
            // f: format.read.varint,
            // g: format.read.varlong,
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
            // f: 128,
            // g: new Long(128, 128),
        } as const
        const buffer = writePacket(packet)
        console.log(buffer)
        const res = readPacket(buffer)
        console.log(res)
        expect(res).toEqual(packet)
    })
})
