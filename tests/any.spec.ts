import { describe, test, expect } from 'bun:test'
import Long from 'long'
import type { Vec3 } from 'vec3'
import v from 'vec3'

describe('any', () => {
    test('test', async () => {
        const buffer = Buffer.allocUnsafe(5)
        console.log(buffer)
        const int = 0xdeadbeef
        buffer.writeInt32BE(int, 0)
        console.log(buffer)
        const int_2 = buffer.readInt32BE(0)
        console.log(int_2)
        console.log(buffer)
    })

    test('test 2', async () => {
        const buffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
        const int = buffer.readInt32BE(0)
        console.log(int, buffer.byteOffset)
    })

    test('test 3', async () => {
        ;(Long.prototype as any)[Bun.inspect.custom] = function () {
            return `Long { ${this.toString()} }`
        }
        const long = Long.fromNumber(0xdeadbeef, true)
        console.log(long)
    })

    test('test 4', async () => {
        const m = new Map<Vec3, number>()
        const vec = v(0, 1, 2)
        m.set(vec, 42)
        console.log(m)
        console.log(m.get(v(0, 1, 2)))
        console.log(m.get(vec))
    })
})
