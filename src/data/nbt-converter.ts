import { inspect } from 'node:util'
import { write } from 'nbtify'

import type { RootTag } from 'nbtify'

const getPath = (file: string) => {
    const url = new URL(file, import.meta.url)
    return Bun.fileURLToPath(url)
}

const path = getPath('./loginPacket.json')

const json: { dimensionCodec: RootTag } = await Bun.file(path).json()
const root = json['dimensionCodec']
console.log(inspect(root, { colors: true, depth: 0 }))

const nbt: Uint8Array = await write(root)
const nbtPath = getPath('./loginPacket.nbt')
await Bun.write(nbtPath, nbt.buffer)
