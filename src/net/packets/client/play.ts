import type { UUID } from '@minecraft-js/uuid'
import type { DimensionResource } from 'region-types'

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
    DataNBT,
    DataSlot,
    DataUnsignedByte,
} from '~/net/types'
import { EntityAnimations, GameMode, type GameEvents } from '~/data/enum'
import { ClientBoundPacketCreator, type ClientBoundPacketData } from '../create'
import type { EntityId } from '~/entity'
import type { EntityTypeId } from '~/data/entities'
import { DataEntityMetadata, type MetadataSchema } from '~/net/types/metadata'

export const BundleDelimiter = new ClientBoundPacketCreator(
    0x00,
    'BundleDelimiter',
    {}
)

export const SpawnEntity = new ClientBoundPacketCreator(0x01, 'SpawnEntity', {
    entityId: new VarInt(),
    entityUUID: new DataUUID(),
    type: new VarInt() as Type<EntityTypeId>,
    x: new DataDouble(),
    y: new DataDouble(),
    z: new DataDouble(),
    pitch: new DataByte(),
    yaw: new DataByte(),
    headYaw: new DataByte(),
    data: new VarInt(),
    velocityX: new DataShort(),
    velocityY: new DataShort(),
    velocityZ: new DataShort(),
})

export const SpawnExperienceOrb = new ClientBoundPacketCreator(
    0x02,
    'SpawnExperienceOrb',
    {
        entityId: new VarInt(),
        x: new DataDouble(),
        y: new DataDouble(),
        z: new DataDouble(),
        count: new DataShort(),
    }
)

export const EntityAnimation = new ClientBoundPacketCreator(
    0x03,
    'EntityAnimation',
    {
        entityId: new VarInt(),
        animation: new DataUnsignedByte() as Type<EntityAnimations>,
    }
)

export const AcknowledgeBlockChange = new ClientBoundPacketCreator(
    0x05,
    'AcknowledgeBlockChange',
    {
        sequence: new VarInt(),
    }
)

export const BlockUpdate = new ClientBoundPacketCreator(0x09, 'BlockUpdate', {
    location: new DataPosition(),
    blockId: new VarInt(),
})

export const CloseContainer = new ClientBoundPacketCreator(
    0x12,
    'CloseContainer',
    {
        windowId: new DataByte(),
    }
)

export const SetContainerContent = new ClientBoundPacketCreator(
    0x13,
    'SetContainerContent',
    {
        windowId: new DataByte(), // 0 for player inventory
        stateId: new VarInt(),
        slots: new DataArray(new DataSlot()),
        carriedItem: new DataSlot(), // Item being dragged with the mouse
    }
)

export const SetContainerPropery = new ClientBoundPacketCreator(
    0x14,
    'SetContainerProperty',
    {
        windowId: new DataByte(),
        property: new DataShort(), // Propery to be updated
        value: new DataShort(), // New value for the property
    }
)

export const SetContainerSlot = new ClientBoundPacketCreator(
    0x15,
    'SetContainerSlot',
    {
        windowId: new DataByte(),
        stateId: new VarInt(),
        slot: new DataShort(),
        item: new DataSlot(),
    }
)

export const PlayDisconnect = new ClientBoundPacketCreator(
    0x19,
    'PlayDisconnect',
    {
        reason: new DataNBT(),
    }
)

export const GameEvent = new ClientBoundPacketCreator(0x20, 'GameEvent', {
    event: new DataObject({
        effect: new DataByte(),
        value: new DataFloat(),
    }) as Type<GameEvents>,
})

export const PlayClientBoundKeepAlive = new ClientBoundPacketCreator(
    0x24,
    'KeepAlive',
    {
        id: new DataLong(),
    },
    false
)

export const ChunkDataAndUpdateLight = new ClientBoundPacketCreator(
    0x25,
    'ChunkDataAndUpdateLight',
    {
        chunkX: new DataInt(),
        chunkZ: new DataInt(),
        heightMaps: new DataNBT(),
        data: new VarIntPrefixedByteArray(),
        blockEntity: new DataArray(
            new DataObject({
                packedXZ: new DataPackedXZ(),
                y: new DataShort(),
                type: new VarInt(),
                data: new DataNBT(),
            })
        ),
        skyLightMask: new DataBitSet(),
        blockLightMask: new DataBitSet(),
        emptySkyLightMask: new DataBitSet(),
        emptyBlockLightMask: new DataBitSet(),
        skyLightArray: new DataArray(new VarIntPrefixedByteArray()),
        blockLightArray: new DataArray(new VarIntPrefixedByteArray()),
    },
    false
)

export const WorldEvent = new ClientBoundPacketCreator(0x26, 'WorldEvent', {
    event: new DataInt(), // TODO: as Type<WorldEventType>
    location: new DataPosition(),
    data: new DataInt(),
    disableRelativeVolume: new DataBoolean(),
})

export const Particle = new ClientBoundPacketCreator(0x27, 'Particle', {
    particleId: new VarInt(), // TODO: as Type<ParticleType>
    longDistance: new DataBoolean(),
    x: new DataDouble(),
    y: new DataDouble(),
    z: new DataDouble(),
    offsetX: new DataFloat(),
    offsetY: new DataFloat(),
    offsetZ: new DataFloat(),
    maxSpeed: new DataFloat(),
    count: new DataInt(),
    data: new VarInt(), // TODO: varies
})

export const UpdateLight = new ClientBoundPacketCreator(0x28, 'UpdateLight', {
    chunkX: new VarInt(),
    chunkZ: new VarInt(),
    skyLightMask: new DataBitSet(),
    blockLightMask: new DataBitSet(),
    emptySkyLightMask: new DataBitSet(),
    emptyBlockLightMask: new DataBitSet(),
    skyLightArray: new DataArray(new VarIntPrefixedByteArray()),
    blockLightArray: new DataArray(new VarIntPrefixedByteArray()),
})

export const PlayLogin = new ClientBoundPacketCreator(0x29, 'PlayLogin', {
    entityId: new DataInt(),
    isHardcore: new DataBoolean(),
    dimensionNames: new DataArray(new DataString() as Type<DimensionResource>),
    maxPlayers: new VarInt(),
    viewDistance: new VarInt(),
    simulationDistance: new VarInt(),
    reducedDebugInfo: new DataBoolean(),
    enableRespawnScreen: new DataBoolean(),
    doLimitedCrafting: new DataBoolean(),
    dimensionType: new DataString() as Type<DimensionResource>,
    dimensionName: new DataString() as Type<DimensionResource>,
    hashedSeed: new DataLong(),
    gameMode: new DataByte() as Type<GameMode>,
    previousGameMode: new DataByte() as Type<GameMode>,
    isDebug: new DataBoolean(),
    isFlat: new DataBoolean(),
    death: new DataOptional(
        new DataObject({
            dimensionName: new DataString() as Type<DimensionResource>,
            location: new DataPosition(),
        })
    ),
    portalCooldown: new VarInt(),
})

// TODO: be able to concatenate packets to avoid repetition

export const UpdateEntityPosition = new ClientBoundPacketCreator(
    0x2c,
    'UpdateEntityPosition',
    {
        entityId: new VarInt(),
        deltaX: new DataShort(), // (currentX * 32 - prevX * 32) * 128
        deltaY: new DataShort(), // (currentY * 32 - prevY * 32) * 128
        deltaZ: new DataShort(), // (currentZ * 32 - prevZ * 32) * 128
        onGround: new DataBoolean(),
    },
    false
)

export const UpdateEntityPositionAndRotation = new ClientBoundPacketCreator(
    0x2d,
    'UpdateEntityPositionRotation',
    {
        entityId: new VarInt(),
        deltaX: new DataShort(), // (currentX * 32 - prevX * 32) * 128
        deltaY: new DataShort(), // (currentY * 32 - prevY * 32) * 128
        deltaZ: new DataShort(), // (currentZ * 32 - prevZ * 32) * 128
        yaw: new DataByte(),
        pitch: new DataByte(),
        onGround: new DataBoolean(),
    },
    false
)

export const UpdateEntityRotation = new ClientBoundPacketCreator(
    0x2e,
    'UpdateEntityRotation',
    {
        entityId: new VarInt(),
        yaw: new DataByte(),
        pitch: new DataByte(),
        onGround: new DataBoolean(),
    },
    false
)

export const OpenScreen = new ClientBoundPacketCreator(0x31, 'OpenScreen', {
    windowId: new VarInt(),
    windowType: new VarInt(),
    windowTitle: new DataNBT(), // TODO: Text Component
})

export const PlayerInfoRemove = new ClientBoundPacketCreator(
    0x3b,
    'PlayerInfoRemove',
    {
        players: new DataArray(new DataUUID()),
    }
)

const AddPlayerAction = new DataObject({
    name: new DataString(),
    properties: new DataArray(
        new DataObject({
            name: new DataString(),
            value: new DataString(),
            signature: new DataOptional(new DataString()),
        })
    ),
})

const PlayerActions = {
    addPlayer: AddPlayerAction,
    signature: new DataOptional(
        new DataObject({
            chatSessionId: new DataUUID(),
            publicKeyExpiryTime: new DataLong(),
            encodedPublicKey: new VarIntPrefixedByteArray(),
            publicKeySignature: new VarIntPrefixedByteArray(),
        })
    ),
    gameMode: new VarInt() as Type<GameMode>,
    listed: new DataBoolean(),
    ping: new VarInt(),
    displayName: new DataOptional(new DataNBT()), // TODO: Text Component
}

const PlayerActionsMask: Record<keyof typeof PlayerActions, number> = {
    addPlayer: 0x01,
    signature: 0x02,
    gameMode: 0x04,
    listed: 0x08,
    ping: 0x10,
    displayName: 0x20,
}

const _PlayerInfoUpdate = new ClientBoundPacketCreator(
    0x3c,
    'PlayerInfoUpdate',
    {
        actions: new DataByte(),
        players: new DataArray(
            new DataObject({
                // TODO: check uuid v3 (see spawn entity below table)
                uuid: new DataUUID(), // player uuid
                playerActions: new DataObject(PlayerActions),
            })
        ),
    }
)

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
            playerActions: ClientBoundPacketData<typeof PlayerActions>
        }[]
    ) => {
        if (players.length === 0) {
            return _PlayerInfoUpdate.serialize({
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
        return _PlayerInfoUpdate.serialize({
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

export const SynchronizePlayerPosition = new ClientBoundPacketCreator(
    0x3e,
    'SynchronizePlayerPosition',
    {
        x: new DataDouble(),
        y: new DataDouble(),
        z: new DataDouble(),
        yaw: new DataFloat(),
        pitch: new DataFloat(),
        flags: new DataByte() as Type<PlayerPositionFlag>,
        teleportId: new VarInt(),
    }
)

export const SetHeadRotation = new ClientBoundPacketCreator(
    0x46,
    'SetHeadRotation',
    {
        entityId: new VarInt(),
        headYaw: new DataByte(),
    }
)

export const SetHeldItem = new ClientBoundPacketCreator(0x51, 'SetHeldItem', {
    slot: new DataByte(),
})

export const SetCenterChunk = new ClientBoundPacketCreator(
    0x52,
    'SetCenterChunk',
    {
        chunkX: new VarInt(),
        chunkZ: new VarInt(),
    }
)

export const SetRenderDistance = new ClientBoundPacketCreator(
    0x53,
    'SetRenderDistance',
    {
        viewDistance: new VarInt(), // 2 - 32
    }
)

export const SetDefaultSpawnPosition = new ClientBoundPacketCreator(
    0x54,
    'SetDefaultSpawnPosition',
    {
        location: new DataPosition(),
        angle: new DataFloat(),
    }
)

// Updates one or more metadata properties for an existing entity.
// Any properties not included in the Metadata field are left unchanged.
export const SetEntityMetadata = <S extends MetadataSchema>(raw: S) =>
    new ClientBoundPacketCreator(0x56, 'SetEntityMetadata', {
        entityId: new VarInt(),
        metadata: new DataEntityMetadata(raw),
    })

// This packet is sent when an entity has been leashed to another entity.
export const LinkEntities = new ClientBoundPacketCreator(0x57, 'LinkEntities', {
    attachedEntityId: new DataInt() as Type<EntityId>,
    holdingEntityId: new DataInt() as Type<EntityId>, // -1 to detach
})
