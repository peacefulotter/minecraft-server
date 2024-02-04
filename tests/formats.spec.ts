import { describe, test, expect } from 'bun:test'
import Long from 'long'
import {
    createServerBoundPacket,
    createClientBoundPacket,
} from '~/packets/create'
import {
    Byte,
    Int,
    Short,
    String,
    VarInt,
    VarIntPrefixedByteArray,
    VarLong,
} from '~/types/basic'

describe('formats', () => {
    test('is identity when writing -> reading', () => {
        const format = {
            a: Byte,
            b: VarIntPrefixedByteArray,
            c: Short,
            d: Int,
            e: String,
            f: VarInt,
            g: VarLong,
        }
        const writePacket = createClientBoundPacket(format)
        const readPacket = createServerBoundPacket(format)
        const packet = {
            a: 42,
            b: Buffer.from([1, 2, 3]),
            c: 5,
            d: 6,
            e: 'hello world',
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
