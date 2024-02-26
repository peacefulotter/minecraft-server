import BitSet from 'bitset'
import { describe, test, expect } from 'bun:test'
import { DataBitSet } from '~/data/types'

describe('BitSet', () => {
    test.only('simple', async () => {
        const bs = new BitSet('1010101101011101000')
        const write = await DataBitSet.write(bs)
        const { t: read } = await DataBitSet.read(write, 0)
        expect(read.toString()).toEqual(bs.toString())
    })

    test('should be encoded into a compact buffer', async () => {
        // encode nb long as varint which is one
        const input = Buffer.from([0x01, 0xaa, 0x35, 0, 0, 0, 0x37, 0, 0])
        const { t: read } = await DataBitSet.read(input, 0)
        const write = await DataBitSet.write(read)
        const { t: read2 } = await DataBitSet.read(write, 0)

        // because DataBitSet strips trailing 0s, just add them back
        const res = Buffer.concat([
            write,
            Buffer.from(new Array(input.length - write.length).fill(0)),
        ])

        expect(res).toEqual(input)
        expect(read).toEqual(read2)
    })

    test('write -> read == identity', async () => {
        const input = Buffer.from([0xaa, 0x35, 0, 0, 0, 0, 0, 0])
        expect(input.length % 8).toBe(0)
        const bitset = new BitSet(input)
        const write = await DataBitSet.write(bitset)
        const { t: read } = await DataBitSet.read(write, 0)
        // console.log(bitset.toString(), read.toString())
        expect(read.toString()).toEqual(bitset.toString())
    })

    test('empty bitset should be encoded as 0', async () => {
        const bitset = new BitSet(0)
        const write = await DataBitSet.write(bitset)
        expect(write).toEqual(Buffer.from([0]))
        const { t: read } = await DataBitSet.read(write, 0)
        expect(read.toString()).toEqual(bitset.toString())
    })
})
