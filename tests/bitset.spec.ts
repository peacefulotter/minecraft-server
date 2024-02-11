import BitSet from 'bitset'
import { describe, test, expect } from 'bun:test'
import { DataBitSet } from '~/data-types/basic'

describe('BitSet', () => {
    test('should be encoded into a compact buffer', () => {
        // encode nb long as varint which is one
        const input = Buffer.from([0x01, 0xaa, 0x35, 0, 0, 0, 0x37, 0, 0])
        const data = input.toJSON().data
        const read = DataBitSet.read(data)
        const bitset = new BitSet(read)
        const write = DataBitSet.write(bitset)

        // because DataBitSet strips trailing 0s, just add them back
        const res = Buffer.concat([
            write,
            Buffer.from(new Array(input.length - write.length).fill(0)),
        ])

        expect(res).toEqual(input)
    })

    test('write -> read == identity', () => {
        const input = Buffer.from([0xaa, 0x35, 0, 0, 0, 0, 0, 0])
        expect(input.length % 8).toBe(0)
        const bitset = new BitSet(input)
        const write = DataBitSet.write(bitset)
        const read = DataBitSet.read(write.toJSON().data)
        // console.log(bitset.toString(), read.toString())
        expect(read.toString()).toEqual(bitset.toString())
    })

    test('empty bitset should be encoded as 0', () => {
        const bitset = new BitSet(0)
        const write = DataBitSet.write(bitset)
        expect(write).toEqual(Buffer.from([0]))
        const read = DataBitSet.read(write.toJSON().data)
        expect(read.toString()).toEqual(bitset.toString())
    })
})
