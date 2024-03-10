import path from 'path'
import * as NBT from 'nbtify'
import {
    NBTParser,
    AnvilParser,
    type TagPayload,
    type ListPayload,
} from 'mc-anvil'

type TagData<
    T extends number,
    N extends string,
    D extends
        | TagPayload
        | TagData<any, any, any>
        | TagData<any, any, any>[]
        | GenericListPayload<any, any>
> = {
    type: T
    name: N
    data: D
}

type PalettedContainer = {
    type: NBT.TAG.LIST
    name: 'palette'
    data: ListPayload
}

type GenericListPayload<
    T extends number,
    D extends TagPayload | TagData<any, any, any>[]
> = {
    subType: T
    data: D[]
}

type ChunkSection =
    | TagData<NBT.TAG.COMPOUND, 'block_states', PalettedContainer[]>
    | TagData<NBT.TAG.COMPOUND, 'biomes', PalettedContainer[]>
    | TagData<NBT.TAG.BYTE, 'BlockLight', number[]>
    | TagData<NBT.TAG.BYTE, 'SkyLight', number[]>
    | TagData<NBT.TAG.BYTE, 'Y', number>

type ChunkData =
    | TagData<NBT.TAG.STRING, 'Status', string>
    | TagData<NBT.TAG.INT, 'zPos', number>
    | TagData<NBT.TAG.LIST, 'block_entities', ListPayload>
    | TagData<NBT.TAG.INT, 'yPos', number>
    | TagData<NBT.TAG.LONG, 'LastUpdate', bigint>
    | TagData<NBT.TAG.COMPOUND, 'structures', any[]>
    | TagData<NBT.TAG.LONG, 'InhabitedTime', bigint>
    | TagData<NBT.TAG.INT, 'xPos', number>
    | TagData<NBT.TAG.COMPOUND, 'Heightmaps', any[]>
    | TagData<
          NBT.TAG.LIST,
          'sections',
          GenericListPayload<NBT.TAG.COMPOUND, ChunkSection[]>
      >
    | TagData<NBT.TAG.BYTE, 'isLightOn', 0 | 1>
    | TagData<NBT.TAG.LIST, 'block_ticks', ListPayload>
    | TagData<NBT.TAG.LIST, 'PostProcessing', ListPayload>
    | TagData<NBT.TAG.BYTE, 'DataVersion', number>
    | TagData<NBT.TAG.LIST, 'fluid_ticks', ListPayload>
    | TagData<NBT.TAG.COMPOUND, 'CarvingMasks', any[]>

type ChunkTag = TagData<NBT.TAG.COMPOUND, '', ChunkData[]>

import { readdir } from 'node:fs/promises'

// read all the files in the current directory
const regions = await readdir(path.join(import.meta.dir, 'region'))
const coords = regions.map((region) => {
    const [x, z] = region.slice(2, -4).split('.')
    return { x: parseInt(x), z: parseInt(z) }
})

const loadTerrain = async (filename: string) => {
    const p = path.join(import.meta.dir, 'region', filename)
    const buffer = await Bun.file(p).arrayBuffer()
    // const regions = readRegion(new Uint8Array(buffer))
    // console.log(regions)
    // const r = regions[0]
    // const a = await readChunks(regions)
    // console.log(a)
    console.log(buffer)

    // const parser = new AnvilParser(buffer)

    // const chunks = parser.getLocationEntries()
    // const firstNonEmptyChunk = chunks.filter((x) => x.offset > 0)[0].offset
    // const data = parser.getChunkData(firstNonEmptyChunk) // receives NBT data of the first chunk
    // const nbtParser = new NBTParser(data)
    // const tag = nbtParser.getTag()
    // console.log(tag)
    // let a = undefined
    // for (const elt of tag['data'] as any[]) {
    //     if (elt.name === 'sections') {
    //         a = elt.data
    //     }
    // }
    // console.log(a)
    // const sec = a.data[a.data.length - 1]
    // console.log(sec)
    // console.log(sec[0])

    // console.log(getNbts(buffer))
}

// const parsers = await Promise.all(regions.map(loadTerrain))
const chunk = await loadTerrain(regions[2])

export const getChunk = async (x: number, z: number) => {
    return chunk
    // console.log(x, z)
    // const chunk = parsers.find((p) => p.getChunkAtChunkCoordinates(x, z))
    // console.log(chunk, chunk?.getChunkData())
    // const buf = chunk?.buffer()
    // console.log(buf)
    // if (!buf) return Buffer.from([])
    // console.log(buf)
    // return Buffer.from(buf)
}

// const formatCoords = (x: number, z: number) => `${x}.${z}`

// const loadTerrain = async (filename: string) => {
//     const file = Bun.file(path.join(import.meta.dir, 'region', filename))
//     const buffer = await file.arrayBuffer()
//     const parser = new AnvilParser(buffer)
//     const chunks = parser.getLocationEntries()
//     const nonEmptyChunks = chunks.filter((x) => x.offset > 0)
//     const data = nonEmptyChunks.reduce((acc, cur) => {
//         const b = parser.getChunkData(cur.offset)

//         if (b !== undefined) acc.push(Buffer.from(b))
//         return acc
//     }, [] as Buffer[])
//     return Buffer.concat(data)
// }

// type Chunk = { chunkX: number; chunkZ: number; region: string; terrain: Buffer }

// const terrain = [] as Chunk[]
// const coordsMap: { [key: string]: number } = {}

// for (let i = 0; i < regions.length; i++) {
//     const { x, z } = coords[i]
//     coordsMap[formatCoords(x, z)] = i
//     terrain.push({
//         chunkX: x,
//         chunkZ: z,
//         region: regions[i],
//         terrain: await loadTerrain(regions[i]),
//     })
// }

// export const getChunk = (x: number, z: number) => {
//     const key = formatCoords(x, z)
//     const idx = coordsMap[key]
//     const chunk = terrain[idx]
//     return chunk.terrain
// }

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
