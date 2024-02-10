import path from 'path'
import { NBTParser, AnvilParser } from 'mc-anvil'

const file = Bun.file(path.join(import.meta.dir, 'region/r.0.0.mca'))
const buffer = await file.arrayBuffer()
const parser = new AnvilParser(buffer)
const chunks = parser.getLocationEntries()
console.log(chunks)
const firstNonEmptyChunk = chunks.filter((x) => x.offset > 0)[0].offset
console.log(firstNonEmptyChunk)
const data = parser.getChunkData(firstNonEmptyChunk) // receives NBT data of the first chunk
// export const data = chunks.reduce((acc, cur) => {
//     const b = parser.getChunkData(cur.offset)
//     if (b === undefined) return acc
//     return Buffer.concat([acc, Buffer.from(b)])
// }, Buffer.from([]))

const nbtParser = new NBTParser(data)
const tag = nbtParser.getTag() // receives content$
console.log(tag)
for (const elt of tag['data'] as any[]) {
    console.log(elt)
}
