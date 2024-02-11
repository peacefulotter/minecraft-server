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
    DataUUID,
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

// export const PlayerInfoUpdate = new ClientBoundPacketCreator(
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

export const SetHeldItem = new ClientBoundPacketCreator(0x51, 'SetHeldItem', {
    slot: DataByte,
})

export const SetCenterChunk = new ClientBoundPacketCreator(
    0x52,
    'SetCenterChunk',
    {
        chunkX: VarInt,
        chunkZ: VarInt,
    }
)

export const SetRenderDistance = new ClientBoundPacketCreator(
    0x53,
    'SetRenderDistance',
    {
        viewDistance: VarInt, // 2 - 32
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
