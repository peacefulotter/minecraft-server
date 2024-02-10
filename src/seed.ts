import crypto from 'crypto'
import Long from 'long'

const HASH_SIZE = 8

export const hashSeed = (seed: string) =>
    Long.fromBytes(
        Buffer.from(
            crypto
                .createHash('sha256')
                .update(seed)
                .digest()
                .buffer.slice(0, HASH_SIZE)
        ).toJSON().data
    )
