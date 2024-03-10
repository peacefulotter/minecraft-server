import * as NBT from 'nbtify'
import { PacketBuffer } from '~/net/PacketBuffer'
import type { Chunk, Section } from '../../Region-Types/src/java'
import {
    DataArray,
    DataLong,
    DataObject,
    DataShort,
    DataUnsignedByte,
    VarInt,
    type Type,
    type InnerReadType,
} from '~/data/types'
import './fix-stream'

const CHUNK_DATA_LENGTH = 4096

class DataEmpty implements Type<number> {
    async read() {
        return 0
    }
    async write(t: number) {
        return PacketBuffer.from([])
    }
}

const DirectPalette = new DataEmpty()
const SingleValuedPalette = new VarInt()
const IndirectPalette = new DataArray(new VarInt())

const BlockPalettedContainerFormat = {
    0: SingleValuedPalette,
    4: IndirectPalette,
    5: IndirectPalette,
    6: IndirectPalette,
    7: IndirectPalette,
    8: IndirectPalette,
    15: DirectPalette,
} as const

const BiomePalettedContainerFormat = {
    0: SingleValuedPalette,
    1: IndirectPalette,
    2: IndirectPalette,
    3: IndirectPalette,
    6: DirectPalette,
} as const

type Palette<
    Rec extends Record<number, Type<any>>,
    Write extends boolean
> = ValueOf<{
    [key in keyof Rec]: {
        bpe: key extends number ? key : never
        palette: Rec[key] extends Type<infer R, infer W>
            ? Write extends true
                ? W
                : R
            : never
        data: Long[]
    }
}>

export class PalettedContainer<R extends Record<number, Type<any>>>
    implements Type<Palette<R, false>, Palette<R, true>>
{
    static bpe = new DataUnsignedByte()
    static data = new DataArray(new DataLong())

    private constructor(
        private readonly paletteFormat: Record<number, Type<any>>
    ) {}

    static from<R extends Record<number, Type<any>>>(paletteFormat: R) {
        return new PalettedContainer<R>(paletteFormat)
    }

    async read(buffer: PacketBuffer) {
        const bpe = await PalettedContainer.bpe.read(buffer)
        const paletteType = this.paletteFormat[bpe]
        const palette = await paletteType.read(buffer)
        const data = await PalettedContainer.data.read(buffer)
        return {
            bpe,
            palette,
            data,
        } as Palette<R, false>
    }

    async write(t: Palette<R, true>) {
        const bpe = await PalettedContainer.bpe.write(t.bpe)
        const paletteType = this.paletteFormat[t.bpe]
        const palette = await paletteType.write(t.palette as never)
        const data = await PalettedContainer.data.write(t.data)
        return PacketBuffer.concat([bpe, palette, data])
    }
}

const ChunkSection = new DataObject({
    blockCount: new DataShort(),
    blockStates: PalettedContainer.from(BlockPalettedContainerFormat),
    biomes: PalettedContainer.from(BiomePalettedContainerFormat),
})

export class DataStructure extends DataArray<typeof ChunkSection> {
    constructor() {
        super(ChunkSection, 24)
    }
}

const REGION_LENGTH = 1024

/*
block count: 1,
block states: {
  bits per entry: 0,
  palette: 56,
  data length: 0,
  data: []
}
biomes: {
    bits per entry: 0,
    palette: 16,
    data length: 0,
    data: []
}
*/

const getCorrectBpe = <R extends { [key: number]: any }>(
    bpe: number,
    ranges: R
): keyof R => {
    if (bpe < 0) return 0

    const max = Math.max(...Object.keys(ranges).map(Number))
    if (bpe > max) return max

    while (!(bpe in ranges)) {
        bpe++
    }

    return bpe
}

const getSection = async (section: Section) => {
    const { palette, data } = section.block_states

    const bpe = Math.ceil(Math.log2(palette.length))

    // TODO: for proper state, use blocks and palette properties
    const paletteIds = palette.map(
        (p) =>
            DB.block_name_to_default_state_id[
                p.Name as keyof typeof DB.block_name_to_default_state_id
            ]
    )

    // TODO: avoid unecessary conversion
    const dataLongs = [...(data || [])].map((n) =>
        Long.fromString(n.toString())
    )

    return await ChunkSection.write({
        blockCount: 256,
        blockStates: {
            bpe: getCorrectBpe(bpe, BlockPalettedContainerFormat),
            palette: paletteIds as any,
            data: dataLongs,
        },
        biomes: {
            bpe: 0,
            palette: biome,
            data: [],
        },
    })
}

type EncodedChunkPosition = `${number},${number}`
type ChunkColumn = PacketBuffer

const parse = async (buffer: Buffer) => {
    const reader = new PacketBuffer(buffer)
    const locations = new Array(REGION_LENGTH).fill(0).map((_, i) => {
        const loc = reader.readInt()
        return {
            offset: (loc >> 8) * CHUNK_DATA_LENGTH,
            sector: (loc & 0xff) * CHUNK_DATA_LENGTH,
        }
    })

    const timestamps = new Array(REGION_LENGTH)
        .fill(0)
        .map(() => reader.readInt())

    const chunks = new Map<EncodedChunkPosition, ChunkColumn>()

    for (const { offset } of locations) {
        if (offset === 0) continue

        reader.readOffset = offset
        const length = reader.readInt()
        const compressionType = reader.readUnsignedByte()

        const rest = reader.readSlice(length)
        const nbt = await NBT.read<Chunk>(rest)
        const { xPos: x, yPos: y, zPos: z, sections } = nbt.data

        const buffers: PacketBuffer[] = []
        for (let i = 0; i < sections.length; i++) {
            const sec = await getSection(sections[i])
            buffers.push(sec)
        }
        const res = PacketBuffer.concat(buffers)
        chunks.set(`${x as unknown as number},${z as unknown as number}`, res)
    }

    console.log(chunks.keys())

    return chunks
}

import path from 'path'
import { EMPTY_CHUNK, biome } from './chunk'
import Long from 'long'
import { DB } from '~/db'
import type { ValueOf } from 'type-fest'

const filename = 'r.0.0.mca'
const p = path.join(import.meta.dir, 'region', filename)
const buffer = await Bun.file(p).arrayBuffer()
const chunks = await parse(Buffer.from(buffer))

export const getChunk = (x: number, z: number) => {
    const chunk = chunks.get(`${x},${z}`)
    return chunk || PacketBuffer.from(EMPTY_CHUNK)
}
