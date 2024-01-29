import * as crypto from 'crypto'

const { publicKey, privateKey } = await new Promise<{
    publicKey: crypto.KeyObject
    privateKey: crypto.KeyObject
}>((resolve) => {
    crypto.generateKeyPair(
        'rsa',
        {
            modulusLength: 2048,
        },
        (err, publicKey, privateKey) => {
            if (err) throw new Error('Failed to generate keys')
            else resolve({ publicKey, privateKey })
        }
    )
})

export const pubKey = publicKey.export({
    type: 'spki',
    format: 'der',
})

export const encrypt = (buffer: Buffer) => {
    return crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_NO_PADDING,
            oaepHash: 'sha1',
        },
        buffer
    )
}

export const decrypt = (buffer: Buffer) => {
    return crypto.privateDecrypt(
        {
            key: privateKey,
            // In order to decrypt the data, we need to specify the
            // same hashing function and padding scheme that we used to
            // encrypt the data in the previous step
            padding: crypto.constants.RSA_NO_PADDING,
            oaepHash: 'sha1',
        },
        buffer
    )
}

// From: https://gist.github.com/andrewrk/4425843
export const hexDigest = (secret: string) => {
    const hash = crypto.createHash('sha1').update(secret).digest()

    return BigInt.asIntN(
        // performs two's compliment
        160, // hash size in bits
        hash.reduce(
            // convert buffer to bigint using reduce
            (a, x) =>
                (a << 8n) | // bit-shift the accumulator 8 bits (one byte) to the left
                BigInt(x), // fill lower byte just freed up by bit-shifting using bitwise or-operator
            0n // start with accumulator value of 0
        )
    ).toString(16) // display the result with base 16 (hex)
}
