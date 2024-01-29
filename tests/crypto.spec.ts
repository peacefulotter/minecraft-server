import { describe, test, expect } from 'bun:test'
import { hexDigest } from '../src/auth'

describe('Crypto', () => {
    test('should encrypt a string', () => {
        expect(hexDigest('Notch')).toBe(
            '4ed1f46bbe04bc756bcb17c0c7ce3e4632f06a48'
        )
        expect(hexDigest('jeb_')).toBe(
            '-7c9d5b0044c130109a5d7b5fb5c317c02b4e28c1'
        )
        expect(hexDigest('simon')).toBe(
            '88e16a1019277b15d58faf0541e11910eb756f6'
        )
    })
})
