import type { DimensionMonsterSpawnLightLevel } from '../../Region-Types/src/java'

// TODO: replace this with fixed type
export const isIntegerDistribution = (
    t: DimensionMonsterSpawnLightLevel | _IntegerDistribution
): t is _IntegerDistribution => {
    return typeof t === 'object'
}

// TODO: replace this with fixed type
export type _IntegerDistribution = {
    type: string
    value: {
        min: number
        max: number
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
