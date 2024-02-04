import chalk from 'chalk'

export const log = (...message: any[]) => {
    const d = new Date()
    console.log(chalk.gray(`[${d.toISOString()}]`), ...message)
}

export const byteToHex = (byte: number) => {
    const key = '0123456789abcdef'
    let bytes = Buffer.from([byte])
    let newHex = ''
    let currentChar = 0
    for (let i = 0; i < bytes.length; i++) {
        // Go over each 8-bit byte
        currentChar = bytes[i] >> 4 // First 4-bits for first hex char
        newHex += key[currentChar] // Add first hex char to string
        currentChar = bytes[i] & 15 // Erase first 4-bits, get last 4-bits for second hex char
        newHex += key[currentChar] // Add second hex char to string
    }
    return '0x' + newHex
}
