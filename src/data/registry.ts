import * as NBT from 'nbtify'
import { Int32 } from 'nbtify'
import { DataInt, DataObject, VarInt, type Type, DataString } from './types'
import type {
    DimensionMonsterSpawnLightLevel,
    DimensionMonsterSpawnLightLevelRange,
} from '../../Region-Types/src/java'

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
