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
} from '~/data/types'
import { GameMode } from '~/data/enum'
import type { DimensionResource } from 'region-types'
import { ClientBoundPacketCreator, type ClientBoundPacketData } from '../create'
import type { ValueOf } from 'type-fest'
import type { UUID } from '@minecraft-js/uuid'
import type { EntityId } from '~/entity'
import type { EntityTypeId } from '~/data/entities'
import { DataEntityMetadata, type MetadataSchema } from '~/entity/metadata'

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
        count: new VarInt(),
        carriedItems: new DataArray(new DataSlot()), // Item being dragged with the mouse
    }
)

// TODO: move this
// https://wiki.vg/Protocol#Set_Container_Property
enum FurnaceProperties {
    FIRE_ICON = 0,
    MAX_FUEL_BURN_TIME,
    PROGRESS_ARROW,
    MAXIMUM_PROGRESS,
}

enum EnchantingTableProperties {
    LEVEL_SLOT_TOP = 0,
    LEVEL_SLOT_MIDDLE,
    LEVEL_SLOT_BOTTOM,
    ENCHANTMENT_SEED,
    ENCHANTMENT_ID_TOP,
    ENCHANTMENT_ID_MIDDLE,
    ENCHANTMENT_ID_BOTTOM,
    ENCHANTMENT_LEVEL_TOP,
    ENCHANTMENT_LEVEL_MIDDLE,
    ENCHANTMENT_LEVEL_BOTTOM,
}

enum BeaconProperties {
    POWER_LEVEL = 0,
    FIRST_POTION_EFFECT,
    SECOND_POTION_EFFECT,
}

enum AnvilProperties {
    REPAIR_COST = 0,
}

enum BrewingStandProperties {
    BREW_TIME = 0,
    FUEL_TIME,
}

enum StonecutterProperties {
    SELECTED_RECIPE = 0,
}

enum LoomProperties {
    SELECTED_PATTERN = 0,
}

enum LecternProperties {
    PAGE = 0,
}

export type ContainerProperties = {
    furnace: FurnaceProperties
    enchanting_table: EnchantingTableProperties
    beacon: BeaconProperties
    anvil: AnvilProperties
    brewing_stand: BrewingStandProperties
    stonecutter: StonecutterProperties
    loom: LoomProperties
    lectern: LecternProperties
}

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
        data: new VarIntPrefixedByteArray(), // TODO: long array?
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
    }
)

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
    }
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
    }
)

export const UpdateEntityRotation = new ClientBoundPacketCreator(
    0x2e,
    'UpdateEntityRotation',
    {
        entityId: new VarInt(),
        yaw: new DataByte(),
        pitch: new DataByte(),
        onGround: new DataBoolean(),
    }
)

export const OpenScreen = new ClientBoundPacketCreator(0x30, 'OpenScreen', {
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
