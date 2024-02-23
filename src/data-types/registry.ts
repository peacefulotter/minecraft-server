import nbt from 'nbt'
import * as NBT from 'nbtify'
import { Int32, type IntTag } from 'nbtify'
import { DataInt, DataObject, VarInt, type Type, DataString } from './basic'
import type {
    DimensionMonsterSpawnLightLevel,
    DimensionMonsterSpawnLightLevelRange,
    IntegerDistribution,
    IntegerDistributionType,
} from '../../Region-Types/src/java'

// type TagBuilder<
//     ID extends number,
//     Name extends string,
//     PayloadSize extends number
// > = {
//     id: ID
//     name: Name
//     payloadSize: PayloadSize
// }

// export type TagBuilders =
//     | TagBuilder<0, 'End', 0>
//     | TagBuilder<1, 'Byte', 1>
//     | TagBuilder<2, 'Short', 2>
//     | TagBuilder<3, 'Int', 4>
//     | TagBuilder<4, 'Long', 8>
//     | TagBuilder<5, 'Float', 4>
//     | TagBuilder<6, 'Double', 8>
//     | TagBuilder<7, 'Byte_Array', 0>
//     | TagBuilder<8, 'String', 0>
//     | TagBuilder<9, 'List', 0>
//     | TagBuilder<10, 'Compound', 0>
//     | TagBuilder<11, 'Int_Array', 0>
//     | TagBuilder<12, 'Long_Array', 0>

// // type Tag<Name extends string> = Extract<Tags, {name: `TAG_${Name}`}>
// type Tags = {
//     [Tag in TagBuilders as TagBuilders['name']]: Omit<Tag, 'name'> & {
//         name: `TAG_${Tag['name']}`
//     }
// }

// TODO: replace this with fixed type
type _IntegerDistribution = {
    type: string
    value: {
        min: number
        max: number
    }
}

const isIntegerDistribution = (
    t: DimensionMonsterSpawnLightLevel | _IntegerDistribution
): t is _IntegerDistribution => {
    return typeof t === 'object'
}

const DataIntegerDistribution: Type<_IntegerDistribution> = DataObject({
    type: DataString,
    value: DataObject({
        min: DataInt,
        max: DataInt,
    }),
})

export const DataDimensionMonsterSpawnLightLevel: Type<DimensionMonsterSpawnLightLevel> =
    {
        read: async (buffer: number[]) => {
            const tagId = await VarInt.read(buffer)
            if (tagId === 0) {
                return new Int32(
                    (await DataInt.read(
                        buffer
                    )) as DimensionMonsterSpawnLightLevelRange
                ) // as unknown as IntTag<DimensionMonsterSpawnLightLevelRange>
            } else {
                return (await DataIntegerDistribution.read(
                    buffer
                )) as DimensionMonsterSpawnLightLevel
            }
        },
        write: async (t: DimensionMonsterSpawnLightLevel) => {
            if (typeof t === 'number') {
                return Buffer.concat([
                    await VarInt.write(0),
                    await DataInt.write(t as number),
                ])
            } else if (isIntegerDistribution(t)) {
                return Buffer.concat([
                    await VarInt.write(1),
                    await DataIntegerDistribution.write(t),
                ])
            }
            throw new Error('Invalid DimensionMonsterSpawnLightLevel')
        },
    }

export const DataNBT: Type<NBT.NBTData<NBT.RootTag>> = class NBTCompoundTag {
    static read = async (buffer: number[]) => {
        return await NBT.read(Buffer.from(buffer), { rootName: null })
    }

    static write = async (t: NBT.NBTData<NBT.RootTag>) => {
        return Buffer.from(await NBT.write(t, { rootName: null }))
    }
}

// export type DimensionType = {
//     fixed_time?: LongTag // [0, 24000]
//     has_skylight: ByteTag // boolean
//     has_ceiling: ByteTag // boolean
//     ultrawarm: ByteTag // boolean
//     natural: ByteTag // boolean
//     coordinate_scale: DoubleTag // [1e-5, 3e7]
//     bed_works: ByteTag // boolean
//     respawn_anchor_works: ByteTag // boolean
//     // /!\ min_y + height <= 2032
//     min_y: IntTag // [-2032, 2032]
//     height: IntTag // [16, 4064]
//     logical_height: IntTag // [0, 4096], %16 == 0, <= height
//     infiniburn: StringTag // '#' or '#minecraft:...'
//     effects: StringTag // 'minecraft:overworld' | 'minecraft:the_nether' | 'minecraft:the_end'
//     ambient_light: FloatTag
//     piglin_safe: ByteTag // boolean
//     has_raids: ByteTag // boolean
//     monsters_spawn_light_level: IntTag | CompoundTag // int: [0, 15]
//     monsters_spawn_block_light_limit: IntTag // [0, 15]
// }
