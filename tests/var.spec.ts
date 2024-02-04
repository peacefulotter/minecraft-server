import { describe, test, expect } from 'bun:test'
import Long from 'long'
import { VarInt, VarLong } from '~/types/basic'

describe('vars work', () => {
    test('some varints', () => {
        console.log(VarInt.write(53))
        console.log(VarInt.read([254, 1]))
        console.log(VarInt.read([250, 0]))
    })

    test('sample varints', () => {
        const buffers = [
            Buffer.from([0x00]),
            Buffer.from([0x01]),
            Buffer.from([0x02]),
            Buffer.from([0x7f]),
            Buffer.from([0x80, 0x01]),
            Buffer.from([0xff, 0x01]),
            Buffer.from([0xdd, 0xc7, 0x01]),
            Buffer.from([0xff, 0xff, 0x7f]),
            Buffer.from([0xff, 0xff, 0xff, 0xff, 0x07]),
            Buffer.from([0xff, 0xff, 0xff, 0xff, 0x0f]),
            Buffer.from([0x80, 0x80, 0x80, 0x80, 0x08]),
        ]
        const values = [
            0, 1, 2, 127, 128, 255, 25565, 2097151, 2147483647, -1, -2147483648,
        ]
        for (let i = 0; i < buffers.length; i++) {
            console.log(VarInt.read(buffers[i].toJSON().data), values[i])
            const read = VarInt.read(buffers[i].toJSON().data)
            const original = VarInt.write(read)
            expect(read).toBe(values[i])
            expect(original).toEqual(buffers[i])
        }
    })

    test('sample varlongs', () => {
        const buffers = [
            Buffer.from([0x00]),
            Buffer.from([0x01]),
            Buffer.from([0x02]),
            Buffer.from([0x7f]),
            Buffer.from([0x80, 0x01]),
            Buffer.from([0xff, 0x01]),
            Buffer.from([0xff, 0xff, 0xff, 0xff, 0x07]),
            Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f]),
            Buffer.from([
                0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01,
            ]),
            Buffer.from([
                0x80, 0x80, 0x80, 0x80, 0xf8, 0xff, 0xff, 0xff, 0xff, 0x01,
            ]),
            Buffer.from([
                0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01,
            ]),
        ]
        const values = [
            new Long(0),
            new Long(1),
            new Long(2),
            new Long(127),
            new Long(128),
            new Long(255),
            new Long(2147483647),
            new Long(0x7fffffff, 0xffffffff),
            new Long(-1),
            new Long(-2147483648),
            new Long(0x80000000, 0x00000000),
        ]
        for (let i = 0; i < buffers.length; i++) {
            // expect(VarLong.write(buffers[i]).eq(values[i]))
        }
    })
})
