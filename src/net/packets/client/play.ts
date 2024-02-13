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
    DataOptional,
    DataPackedXZ,
    DataUUID,
    type AsyncType,
    type ObjectResult,
} from '~/data-types/basic'
import { GameMode } from '~/data-types/enum'
import type {
    DimensionInfiniburn,
    DimensionResource,
    DimensionMonsterSpawnLightLevelRange,
} from 'region-types'
import { ClientBoundPacketCreator } from '../create'
import { DataNBT } from '~/data-types/registry'
import type { ValueOf } from 'type-fest'

export const BundleDelimiter = ClientBoundPacketCreator(
    0x00,
    'BundleDelimiter',
    {}
)

type GameEffect<N extends string, E extends number, V extends number> = {
    name: N
    effect: E
    value: V
}

type GameEventEffect =
    | GameEffect<'NO_RESPAWN_BLOCK_AVAILABLE', 0, number>
    | GameEffect<'END_RAINING', 1, number>
    | GameEffect<'BEGIN_RAINING', 2, number>
    | GameEffect<'CHANGE_GAME_MODE', 3, GameMode>
    | GameEffect<'WIN_GAME', 4, 0 | 1>
    | GameEffect<'DEMO_EVENT', 5, 0 | 101 | 102 | 103 | 104>
    | GameEffect<'ARROW_HIT_PLAYER', 6, number>
    | GameEffect<'RAIN_LEVEL_CHANGE', 7, number> // [0, 1]
    | GameEffect<'THUNDER_LEVEL_CHANGE', 8, number> // [0, 1]
    | GameEffect<'PUFFER_FISH_STING', 9, number>
    | GameEffect<'GUARDIAN_ELDER_APPEARANCE', 10, number>
    | GameEffect<'ENABLE_RESPAWN_SCREEN', 11, 0 | 1>
    | GameEffect<'LIMITED_CRAFTING', 12, 0 | 1>
    | GameEffect<'START_WAITING_CHUNKS', 13, number>

type GameEvents = ValueOf<{
    [K in GameEventEffect as K['name']]: Omit<K, 'name'>
}>

export const GameEvent = ClientBoundPacketCreator(0x20, 'GameEvent', {
    event: DataObject({
        effect: DataByte,
        value: DataFloat,
    }) as AsyncType<GameEvents>,
})

export const ChunkDataAndUpdateLight = ClientBoundPacketCreator(
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

export const PlayLogin = ClientBoundPacketCreator(0x29, 'PlayLogin', {
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
    death: DataOptional(
        DataObject({
            dimensionName: DataString as Type<DimensionResource>,
            location: DataPosition,
        })
    ),
    portalCooldown: VarInt,
})

// export const PlayerInfoUpdate =  ClientBoundPacketCreator(
//     0x32,
//     'PlayerInfoUpdate',
//     {
//         action: DataByte,
//         data: DataArray(
//             DataObject({
//                 uuid: DataUUID,
//                 name: DataString,
//                 properties: DataArray(
//                     DataObject({
//                         uuid: DataUUID,
//                         actions: DataArray(DataPlayerActions),
//                     })
//                 ),
//             })
//         ),
//     }
// )

export enum PlayerPositionFlag {
    NONE = 0x00,
    X = 0x01,
    Y = 0x02,
    Z = 0x04,
    Y_ROT = 0x08,
    X_ROT = 0x10,
}

export const SynchronizePlayerPosition = ClientBoundPacketCreator(
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

export const SetHeldItem = ClientBoundPacketCreator(0x51, 'SetHeldItem', {
    slot: DataByte,
})

export const SetCenterChunk = ClientBoundPacketCreator(0x52, 'SetCenterChunk', {
    chunkX: VarInt,
    chunkZ: VarInt,
})

export const SetRenderDistance = ClientBoundPacketCreator(
    0x53,
    'SetRenderDistance',
    {
        viewDistance: VarInt, // 2 - 32
    }
)

export const SetDefaultSpawnPosition = ClientBoundPacketCreator(
    0x54,
    'SetDefaultSpawnPosition',
    {
        location: DataPosition,
        angle: DataFloat,
    }
)
