import path from 'path'
import * as NBT from 'nbtify'
import {
    // NBTParser,
    AnvilParser,
    // type TagPayload,
    // type ListPayload,
} from 'mc-anvil'

// type TagData<
//     T extends number,
//     N extends string,
//     D extends
//         | TagPayload
//         | TagData<any, any, any>
//         | TagData<any, any, any>[]
//         | GenericListPayload<any, any>
// > = {
//     type: T
//     name: N
//     data: D
// }

// type PalettedContainer = {
//     type: NBT.TAG.LIST
//     name: 'palette'
//     data: ListPayload
// }

// type GenericListPayload<
//     T extends number,
//     D extends TagPayload | TagData<any, any, any>[]
// > = {
//     subType: T
//     data: D[]
// }

// type ChunkSection =
//     | TagData<NBT.TAG.COMPOUND, 'block_states', PalettedContainer[]>
//     | TagData<NBT.TAG.COMPOUND, 'biomes', PalettedContainer[]>
//     | TagData<NBT.TAG.BYTE, 'BlockLight', number[]>
//     | TagData<NBT.TAG.BYTE, 'SkyLight', number[]>
//     | TagData<NBT.TAG.BYTE, 'Y', number>

// type ChunkData =
//     | TagData<NBT.TAG.STRING, 'Status', string>
//     | TagData<NBT.TAG.INT, 'zPos', number>
//     | TagData<NBT.TAG.LIST, 'block_entities', ListPayload>
//     | TagData<NBT.TAG.INT, 'yPos', number>
//     | TagData<NBT.TAG.LONG, 'LastUpdate', bigint>
//     | TagData<NBT.TAG.COMPOUND, 'structures', any[]>
//     | TagData<NBT.TAG.LONG, 'InhabitedTime', bigint>
//     | TagData<NBT.TAG.INT, 'xPos', number>
//     | TagData<NBT.TAG.COMPOUND, 'Heightmaps', any[]>
//     | TagData<
//           NBT.TAG.LIST,
//           'sections',
//           GenericListPayload<NBT.TAG.COMPOUND, ChunkSection[]>
//       >
//     | TagData<NBT.TAG.BYTE, 'isLightOn', 0 | 1>
//     | TagData<NBT.TAG.LIST, 'block_ticks', ListPayload>
//     | TagData<NBT.TAG.LIST, 'PostProcessing', ListPayload>
//     | TagData<NBT.TAG.BYTE, 'DataVersion', number>
//     | TagData<NBT.TAG.LIST, 'fluid_ticks', ListPayload>
//     | TagData<NBT.TAG.COMPOUND, 'CarvingMasks', any[]>

// type ChunkTag = TagData<NBT.TAG.COMPOUND, '', ChunkData[]>

import { readdir } from 'node:fs/promises'
import type { Chunk } from 'region-types'

// read all the files in the current directory
const regions = await readdir(path.join(import.meta.dir, 'region'))
const coords = regions.map((region) => {
    const [x, z] = region.slice(2, -4).split('.')
    return { x: parseInt(x), z: parseInt(z) }
})
console.log(coords)

const formatCoords = (x: number, z: number) => `${x}.${z}`

const chunkNBTFormat = {
    rootName: "",
    endian: "big",
    compression: null,
    bedrockLevel: null
} as const satisfies NBT.Format;

const loadTerrain = async (filename: string) => {
    const file = Bun.file(path.join(import.meta.dir, 'region', filename))
    const buffer = await file.arrayBuffer()
    const parser = new AnvilParser(buffer)
    const chunks = parser.getLocationEntries()
    const nonEmptyChunks = chunks.filter((x) => x.offset > 0)
    const data = nonEmptyChunks.reduce((acc, cur) => {
        const b = parser.getChunkData(cur.offset)
        if (b === undefined) return acc
        return Buffer.concat([acc, Buffer.from(b)])
    }, Buffer.from([]))
    const tag = await NBT.read<Chunk>(data.buffer,{ ...chunkNBTFormat, strict: false })
    console.log(tag)
    return data
}

const terrain = (await Promise.all(
    coords.map(async ({ x, z }, i) => {
        return [
            formatCoords(x, z),
            {
                chunkX: x,
                chunkZ: z,
                region: regions[i],
                terrain: await loadTerrain(regions[i]),
            },
        ]
    })
)) as [
    string,
    { chunkX: number; chunkZ: number; region: string; terrain: Buffer }
][]

export const terrainMap = new Map(terrain)
console.log(terrainMap)
console.log(terrainMap.get(formatCoords(0, 1)))

// type ChunkTagObj = {
//     [K in ChunkData['name']]?: Extract<ChunkData, { name: K }>
// }

// const nbtParser = new NBTParser(data)
// const tag = nbtParser.getTag() as unknown as ChunkTag

// console.log(tag)
// for (const elt of tag['data']) {
//     console.log(elt)
// }

// const obj = tag.data.reduce(
//     (acc, cur) => ({ ...acc, [cur.name]: cur }),
//     {} as ChunkTagObj
// )

// const getNBT = async (sections?: Extract<ChunkData, { name: 'sections' }>) => {
//     if (!sections) return
//     const sectionsData = sections.data.data
//     console.log('3 ===================')
//     console.log(sectionsData)
//     console.log('4 ===================')
//     console.log(sectionsData[0])
//     console.log('5 ===================')
//     console.log(sectionsData.length)
//     console.log(sectionsData[0].length)
//     console.log('6 ===================')
//     console.log(sectionsData[23][0].data)
//     console.log(sectionsData[23][0].data[0].data.data)
//     console.log('7 ===================')
//     console.log(sectionsData[23][1].data)
//     console.log(sectionsData[23][1].data[0].data.data)
//     console.log('8 ===================')
//     console.log(sectionsData[23][2])
//     console.log(sectionsData[23][2].data)
//     console.log(sectionsData[23][2].data[0])
//     const a = await NBT.write(data)
//     const b = await NBT.read(a, { rootName: null })
//     const c = await NBT.write(data, { rootName: null })
//     console.log(a)
//     console.log(b.data)
//     console.log(b.data.data.data)
//     console.log(c)
// }

// await getNBT(obj.sections)
// await getNBT(obj.Heightmaps)
