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
    DataAngle,
} from '~/data-types/basic'
import { GameMode } from '~/data-types/enum'
import type { DimensionResource } from 'region-types'
import { ClientBoundPacketCreator, type PacketArguments } from '../create'
import { DataNBT } from '~/data-types/registry'
import type { ValueOf } from 'type-fest'
import type { UUID } from '@minecraft-js/uuid'
import type { EntityId } from '~/entity/entity'
import type { EntityTypeId } from '~/data-types/entities'
import { DataEntityMetadata } from '~/entity/metadata'

export const BundleDelimiter = ClientBoundPacketCreator(
    0x00,
    'BundleDelimiter',
    {}
)

export const SpawnEntity = ClientBoundPacketCreator(0x01, 'SpawnEntity', {
    entityId: VarInt,
    entityUUID: DataUUID,
    type: VarInt as Type<EntityTypeId>,
    x: DataDouble,
    y: DataDouble,
    z: DataDouble,
    pitch: DataAngle,
    yaw: DataAngle,
    headYaw: DataAngle,
    data: VarInt,
    velocityX: DataShort,
    velocityY: DataShort,
    velocityZ: DataShort,
})

export const PlayDisconnect = ClientBoundPacketCreator(0x19, 'PlayDisconnect', {
    reason: DataNBT,
})

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
    }) as Type<GameEvents>,
})

export const PlayClientBoundKeepAlive = ClientBoundPacketCreator(
    0x24,
    'KeepAlive',
    {
        id: DataLong,
    }
)

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

// TODO: be able to concatenate packets to avoid repetition

export const UpdateEntityPosition = ClientBoundPacketCreator(
    0x2c,
    'UpdateEntityPosition',
    {
        entityId: VarInt,
        deltaX: DataShort, // (currentX * 32 - prevX * 32) * 128
        deltaY: DataShort, // (currentY * 32 - prevY * 32) * 128
        deltaZ: DataShort, // (currentZ * 32 - prevZ * 32) * 128
        onGround: DataBoolean,
    }
)

export const UpdateEntityPositionAndRotation = ClientBoundPacketCreator(
    0x2d,
    'UpdateEntityPositionRotation',
    {
        entityId: VarInt,
        deltaX: DataShort, // (currentX * 32 - prevX * 32) * 128
        deltaY: DataShort, // (currentY * 32 - prevY * 32) * 128
        deltaZ: DataShort, // (currentZ * 32 - prevZ * 32) * 128
        yaw: DataAngle,
        pitch: DataAngle,
        onGround: DataBoolean,
    }
)

export const UpdateEntityRotation = ClientBoundPacketCreator(
    0x2e,
    'UpdateEntityRotation',
    {
        entityId: VarInt,
        yaw: DataAngle,
        pitch: DataAngle,
        onGround: DataBoolean,
    }
)

export const PlayerInfoRemove = ClientBoundPacketCreator(
    0x3b,
    'PlayerInfoRemove',
    {
        players: DataArray(DataUUID),
    }
)

const AddPlayerAction = DataObject({
    name: DataString,
    properties: DataArray(
        DataObject({
            name: DataString,
            value: DataString,
            signature: DataOptional(DataString),
        })
    ),
})

const InitializeChatAction = DataObject({
    signatureData: DataOptional(
        DataObject({
            chatSessionId: DataUUID,
            publicKeyExpiryTime: DataLong,
            encodedPublicKey: VarIntPrefixedByteArray,
            publicKeySignature: VarIntPrefixedByteArray,
        })
    ),
})

const UpdateGameModeAction = DataObject({
    gameMode: VarInt as Type<GameMode>,
})

const UpdateListedAction = DataObject({
    listed: DataBoolean,
})

const UpdateLatencyAction = DataObject({
    ping: VarInt,
})

const UpdateDisplayNameAction = DataObject({
    displayName: DataOptional(DataNBT), // TODO: must be DataNBT
})

const PlayerActions = {
    addPlayer: AddPlayerAction,
    initializeChat: InitializeChatAction,
    updateGameMode: UpdateGameModeAction,
    updateListed: UpdateListedAction,
    updateLatency: UpdateLatencyAction,
    updateDisplayName: UpdateDisplayNameAction,
}

const PlayerActionsMask: Record<keyof typeof PlayerActions, number> = {
    addPlayer: 0x01,
    initializeChat: 0x02,
    updateGameMode: 0x04,
    updateListed: 0x08,
    updateLatency: 0x10,
    updateDisplayName: 0x20,
}

const _PlayerInfoUpdate = ClientBoundPacketCreator(0x3c, 'PlayerInfoUpdate', {
    actions: DataByte,
    players: DataArray(
        DataObject({
            // TODO: check uuid v3 (see spawn entity below table)
            uuid: DataUUID, // player uuid
            playerActions: DataObject(PlayerActions),
        })
    ),
})

// Wrapper for private PlayerInfoUpdate to compute the actions byte
export const PlayerInfoUpdate =
    // Used with DataObjectOptional which is not implemented (see DataObjectOptional)
    // <
    //     // Enforce all player actions to be the same type (same keys defined)
    //     P extends Partial<PacketArguments<typeof PlayerActions>>
    // >(
    //     players: {
    //         uuid: UUID
    //         // Enforce all player actions to be the same type (same keys defined)
    //         playerActions: { [K in keyof P]: P[K] }
    //     }[]
    (
        players: {
            uuid: UUID
            // Enforce all player actions to be the same type (same keys defined)
            playerActions: PacketArguments<typeof PlayerActions>
        }[]
    ) => {
        if (players.length === 0) {
            return _PlayerInfoUpdate({
                actions: 0,
                players: [],
            })
        }

        const actions = Object.keys(players[0].playerActions).reduce(
            (acc, key) => {
                return (
                    acc | PlayerActionsMask[key as keyof typeof PlayerActions]
                )
            },
            0
        )
        return _PlayerInfoUpdate({
            actions,
            players,
        })
    }

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

export const SetHeadRotation = ClientBoundPacketCreator(
    0x46,
    'SetHeadRotation',
    {
        entityId: VarInt,
        headYaw: DataAngle,
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

// Updates one or more metadata properties for an existing entity.
// Any properties not included in the Metadata field are left unchanged.
export const SetEntityMetadata = ClientBoundPacketCreator(
    0x56,
    'SetEntityMetadata',
    {
        entityId: VarInt,
        metadata: DataEntityMetadata,
    }
)

// This packet is sent when an entity has been leashed to another entity.
export const LinkEntities = ClientBoundPacketCreator(0x57, 'LinkEntities', {
    attachedEntityId: DataInt as Type<EntityId>,
    holdingEntityId: DataInt as Type<EntityId>, // -1 to detach
})
