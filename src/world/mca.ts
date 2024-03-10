import * as NBT from 'nbtify'
import { PacketBuffer } from '~/net/PacketBuffer'
import converter, { NumberConverter } from 'javascript-binary-converter'
import type { Chunk } from '../../Region-Types/src/java'
import {
    DataArray,
    DataLong,
    DataObject,
    DataShort,
    DataUnsignedByte,
    VarInt,
    type Type,
    type InnerReadType,
    type InnerWriteType,
} from '~/data/types'
import './fix-stream'

type F<B extends number, P extends Type<any>> = {
    bpe: B
    palette: InnerReadType<P>
    data: Long[]
}

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

type PaletteType = Palette<typeof BlockPalettedContainerFormat, false>

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

type T = InnerWriteType<typeof ChunkSection>

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

const parse = async (buffer: Buffer) => {
    const reader = new PacketBuffer(buffer)
    const locations = new Array(REGION_LENGTH).fill(0).map((_, i) => {
        const loc = reader.readInt()
        return {
            offset: loc >> 8,
            sector: loc & 0xff,
        }
    })
    console.log(locations)

    const timestamps = new Array(REGION_LENGTH)
        .fill(0)
        .map(() => reader.readInt())
    console.log(timestamps)

    const length = reader.readInt()
    const compressionType = reader.readUnsignedByte()
    console.log(length, compressionType)

    const rest = reader.readSlice(length)
    const nbt = await NBT.read<Chunk>(rest)
    const { xPos: x, yPos: y, zPos: z, sections } = nbt.data
    console.log({ x, y, z })
    console.log(sections)
    console.log('===============================================')

    const sec = sections[5]
    console.log(sec)
    console.log(sec.block_states)

    const bpe = Math.ceil(Math.log2(sec.block_states.palette.length))
    const palette = sec.block_states.palette.map(
        (p) => DB.block_name_to_id[p.Name as keyof typeof DB.block_name_to_id]
    )

    console.log(bpe, palette)

    const data = (sec.block_states.data as unknown as bigint[]).map((n) =>
        Long.fromString(n.toString())
    )

    console.log('data', data)

    // const n = sec.block_states.data?.[0] as bigint
    // console.log(n)
    // const l = Long.fromString(n.toString())
    // console.log(l.toString())
    // const bin = l
    //     .toBytesBE()
    //     .map((b) => (converter(b) as unknown as NumberConverter).toBinary())
    // console.log('bin', bin)

    // console.log(Buffer.from(l.toBytesBE()).toString())
    // console.log(Buffer.from(l.toBytesBE()).toString('binary'))
    // console.log(sec.biomes)

    const section = await ChunkSection.write({
        blockCount: 64,
        blockStates: {
            bpe: bpe as any,
            palette: palette,
            data: data,
        },
        biomes: {
            bpe: 0,
            palette: biome,
            data: [],
        },
    })
    console.log(section.buffer)

    return Buffer.concat(
        new Array(24)
            .fill(0)
            .map((_, i) =>
                i === 2 ? section.buffer : Buffer.from(EMPTY_CHUNK)
            )
    )
}

import path from 'path'
import { EMPTY_CHUNK, biome } from './chunk'
import Long from 'long'
import { DB } from '~/db'
import type { ValueOf } from 'type-fest'

const filename = 'r.0.0.mca'
const p = path.join(import.meta.dir, 'region', filename)
const buffer = await Bun.file(p).arrayBuffer()
export const mca = await parse(Buffer.from(buffer))
