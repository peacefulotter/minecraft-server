import { describe, test, expect } from 'bun:test'

describe('Buffer', () => {
    test('test', async () => {
        const buffer = Buffer.allocUnsafe(5)
        console.log(buffer)
        const int = 0xdeadbeef
        buffer.writeInt32BE(int, 0)
        console.log(buffer)
        const int_2 = buffer.readInt32BE(0)
        console.log(int_2)
        console.log(buffer)
        expect(int).toBe(int_2)
    })

    test('test 2', async () => {
        const buffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        const int = buffer.readInt32BE(0)
        console.log(int, buffer.byteOffset)
    })
})
