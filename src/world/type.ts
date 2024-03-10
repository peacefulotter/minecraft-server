import type Long from 'long'
import type { ValueOf } from 'type-fest'
import {
    VarInt,
    type Type,
    DataArray,
    DataUnsignedByte,
    DataLong,
    DataObject,
    DataShort,
    type InnerWriteType,
} from '~/data/types'
import { PacketBuffer } from '~/net/PacketBuffer'

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

export const BlockPalettedContainerFormat = {
    0: SingleValuedPalette,
    4: IndirectPalette,
    5: IndirectPalette,
    6: IndirectPalette,
    7: IndirectPalette,
    8: IndirectPalette,
    15: DirectPalette,
} as const

export const BiomePalettedContainerFormat = {
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

export type ChunkSection = InnerWriteType<typeof ChunkSection>

export class DataStructure extends DataArray<typeof ChunkSection> {
    constructor() {
        super(ChunkSection, 24)
    }
}
