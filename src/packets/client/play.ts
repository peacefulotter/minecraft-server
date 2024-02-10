import {
    DataBoolean,
    DataByte,
    DataInt,
    DataLong,
    DataString,
    VarInt,
    type Type,
    DataPosition,
    DataArray,
    DataObject,
    DataShort,
    DataBitSet,
    VarIntPrefixedByteArray,
    DataDouble,
    DataFloat,
    Optional,
    DataPackedXZ,
} from '~/data-types/basic'
import { GameMode } from '~/data-types/enum'
import type {
    DimensionInfiniburn,
    DimensionResource,
    DimensionMonsterSpawnLightLevelRange,
} from 'region-types'
import { ClientBoundPacketCreator } from '../create'
import { DataNBT } from '~/data-types/registry'

export const ChunkDataAndUpdateLight = new ClientBoundPacketCreator(
    0x25,
    'ChunkDataAndUpdateLight',
    {
        chunkX: DataInt,
        chunkZ: DataInt,
        heightMaps: DataNBT,
        data: VarIntPrefixedByteArray, // TODO: long array?
        blockEntity: DataArray(
            DataObject({
                packedXZ: DataPackedXZ,
                y: DataShort,
                type: VarInt,
                data: DataNBT,
            })
        ),
        skyLightMask: DataBitSet,
        blockLightMask: DataBitSet,
        emptySkyLightMask: DataBitSet,
        emptyBlockLightMask: DataBitSet,
        skyLightArray: DataArray(VarIntPrefixedByteArray),
        blockLightArray: DataArray(VarIntPrefixedByteArray),
    }
)

// fixed_time?: LongTag;
//   has_skylight: BooleanTag;
//   has_ceiling: BooleanTag;
//   ultrawarm: BooleanTag;
//   natural: BooleanTag;
//   coordinate_scale: DoubleTag;
//   bed_works: BooleanTag;
//   respawn_anchor_works: BooleanTag;
//   min_y: IntTag;
//   height: IntTag;
//   logical_height: IntTag;
//   infiniburn: DimensionInfiniburn;
//   effects: StringTag; // `DimensionResource`
//   ambient_light: FloatTag;
//   piglin_safe: BooleanTag;
//   has_raids_safe: BooleanTag;
//   monster_spawn_light_level: DimensionMonsterSpawnLightLevel;
//   monster_spawn_block_light_limit: IntTag<DimensionMonsterSpawnLightLevelRange>;

// DataObject({
//     fixed_time: DataLong,
//     has_skylight: DataBoolean,
//     has_ceiling: DataBoolean,
//     ultrawarm: DataBoolean,
//     natural: DataBoolean,
//     coordinate_scale: DataDouble,
//     bed_works: DataBoolean,
//     respawn_anchor_works: DataBoolean,
//     min_y: DataInt,
//     height: DataInt,
//     logical_height: DataInt,
//     infiniburn: DataString as Type<DimensionInfiniburn>,
//     effects: DataString, // TODO: `DimensionResource`
//     ambient_light: DataFloat,
//     piglin_safe: DataBoolean,
//     has_raids_safe: DataBoolean,
//     monster_spawn_light_level: ,
//     monster_spawn_block_light_limit: DataInt as Type<
//         IntTag<DimensionMonsterSpawnLightLevelRange>
//     >,
// })

export const PlayLogin = new ClientBoundPacketCreator(0x29, 'PlayLogin', {
    entityId: DataInt,
    isHardcore: DataBoolean,
    dimensionNames: DataArray(DataString as Type<DimensionResource>),
    maxPlayers: VarInt,
    viewDistance: VarInt,
    simulationDistance: VarInt,
    reducedDebugInfo: DataBoolean,
    enableRespawnScreen: DataBoolean,
    doLimitedCrafting: DataBoolean,
    dimensionType: DataString as Type<DimensionResource>,
    dimensionName: DataString as Type<DimensionResource>,
    hashedSeed: DataLong,
    gameMode: DataByte as Type<GameMode>,
    previousGameMode: DataByte as Type<GameMode>,
    isDebug: DataBoolean,
    isFlat: DataBoolean,
    death: Optional(
        DataObject({
            dimensionName: DataString as Type<DimensionResource>,
            location: DataPosition,
        })
    ),
    portalCooldown: VarInt,
})

export enum PlayerPositionFlag {
    X = 0x01,
    Y = 0x02,
    Z = 0x04,
    Y_ROT = 0x08,
    X_ROT = 0x10,
}

export const SynchronizePlayerPosition = new ClientBoundPacketCreator(
    0x3e,
    'SynchronizePlayerPosition',
    {
        x: DataDouble,
        y: DataDouble,
        z: DataDouble,
        yaw: DataFloat,
        pitch: DataFloat,
        flags: DataByte as Type<PlayerPositionFlag>,
        teleportId: VarInt,
    }
)

export const SetDefaultSpawnPosition = new ClientBoundPacketCreator(
    0x54,
    'SetDefaultSpawnPosition',
    {
        location: DataPosition,
        angle: DataFloat,
    }
)
