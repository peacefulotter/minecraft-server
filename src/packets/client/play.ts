import {
    DataBoolean,
    DataByte,
    DataInt,
    DataLong,
    DataString,
    VarInt,
    type Type,
    DataPosition,
    DataByteArray,
    DataArray,
    DataObject,
    DataShort,
    DataBitSet,
    VarIntPrefixedByteArray,
    DataDouble,
    DataFloat,
} from '~/data-types/basic'
import { createClientBoundPacket } from '../create'
import { GameMode } from '~/data-types/enum'

export const ChunkDataAndUpdateLight = createClientBoundPacket(
    0x25,
    'ChunkDataAndUpdateLight',
    {
        chunkX: DataInt,
        chunkZ: DataInt,
        heightMaps: DataBoolean, // TODO: NBT
        size: VarInt,
        data: DataByteArray, // TODO
        blockEntity: DataArray(
            DataObject({
                packedXZ: DataByte,
                y: DataShort,
                type: VarInt,
                data: DataBoolean, // TODO: NBT
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

export const PlayLogin = createClientBoundPacket(0x29, 'PlayLogin', {
    entityId: DataInt,
    isHardcore: DataBoolean,
    dimensionNames: DataInt, // Array<DimensionName>,
    maxPlayers: VarInt,
    viewDistance: VarInt,
    simulationDistance: VarInt,
    reducedDebugInfo: DataBoolean,
    enableRespawnScreen: DataBoolean,
    doLimitedCrafting: DataBoolean,
    dimensionType: DataInt, // Identifier
    dimensionName: DataString, // Identifier
    hashedSeed: DataLong,
    gameMode: DataByte as Type<GameMode>,
    previousGameMode: DataByte as Type<-1 | GameMode>,
    isDebug: DataBoolean,
    isFlat: DataBoolean,
    hasDeathLocation: DataBoolean,
    deathDimensionName: DataString, // Optional, Identifier
    deathLocation: DataPosition, // Optional
    portalCooldown: VarInt,
})

export enum PlayerPositionFlag {
    X = 0x01,
    Y = 0x02,
    Z = 0x04,
    Y_ROT = 0x08,
    X_ROT = 0x10,
}

export const SynchronizePlayerPosition = createClientBoundPacket(
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

export const SetDefaultSpawnPosition = createClientBoundPacket(
    0x54,
    'SetDefaultSpawnPosition',
    {
        location: DataPosition,
        angle: DataFloat,
    }
)
