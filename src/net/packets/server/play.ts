import {
    VarInt,
    type Type,
    DataByte,
    DataFloat,
    DataString,
    DataBoolean,
    DataLong,
    DataDouble,
    DataInt,
    DataShort,
    DataUUID,
    DataPosition,
    DataArray,
    DataObject,
    DataByteArray,
    DataBitSet,
    DataFixedBitSet,
    DataOptional,
} from '~/data-types/basic'
import { ServerBoundPacketCreator } from '../create'
import type { Difficulty } from '~/data-types/enum'
import type { EntityId } from '~/entity/entity'

export const ConfirmTeleportation = ServerBoundPacketCreator(
    0x00,
    'ConfirmTeleportation',
    {
        id: VarInt,
    }
)

// export const QueryBlockEntityTag =  ServerBoundPacket(0x01, {
//     transactionId: VarInt,
//     location: Position,
// })

export const ChangeDifficulty = ServerBoundPacketCreator(
    0x02,
    'ChangeDifficulty',
    {
        difficulty: DataByte as Type<Difficulty>,
    }
)

export const AcknowledgeMessage = ServerBoundPacketCreator(
    0x03,
    'AcknowledgeMessage',
    {
        id: VarInt,
    }
)

export const ChatCommand = ServerBoundPacketCreator(0x04, 'ChatCommand', {
    command: DataString,
    timestamp: DataLong,
    salt: DataLong,
    args: DataArray(
        DataObject({
            name: DataString,
            signature: DataByteArray(256),
        })
    ),
    messageCount: VarInt,
    acknowledged: DataFixedBitSet(20 / 8),
})

export const ChatMessage = ServerBoundPacketCreator(0x05, 'ChatMessage', {
    message: DataString,
    timestamp: DataLong,
    salt: DataLong,
    signature: DataOptional(DataByteArray(256)),
    messageCount: VarInt,
    acknowledged: DataFixedBitSet(20 / 8),
})

export const PlayerSession = ServerBoundPacketCreator(0x06, 'PlayerSession', {
    // TODO: Implement
})

export const ChunkBatchReceived = ServerBoundPacketCreator(
    0x07,
    'ChunkBatchReceived',
    {
        chunkPerTick: DataFloat,
    }
)

export const ClientStatus = ServerBoundPacketCreator(0x08, 'ClientStatus', {
    actionId: VarInt as Type<0 | 1>,
})

export const PlayClientInformation = ServerBoundPacketCreator(
    0x09,
    'ClientInformation',
    {
        locale: DataString,
        viewDistance: DataByte,
        chatMode: VarInt,
        chatColors: DataByte,
        displayedSkinParts: DataByte,
        mainHand: VarInt,
        enableTextFiltering: DataBoolean,
        allowServerListings: DataBoolean,
    }
)

export const PlayServerBoundKeepAlive = ServerBoundPacketCreator(
    0x15,
    'KeepAlive',
    {
        id: DataLong,
    }
)

export const SetPlayerPosition = ServerBoundPacketCreator(
    0x17,
    'SetPlayerPosition',
    {
        x: DataDouble,
        y: DataDouble,
        z: DataDouble,
        onGround: DataBoolean,
    }
)

export const SetPlayerPositionAndRotation = ServerBoundPacketCreator(
    0x18,
    'PlayerPositionAndRotation',
    {
        x: DataDouble,
        y: DataDouble,
        z: DataDouble,
        yaw: DataFloat,
        pitch: DataFloat,
        onGround: DataBoolean,
    }
)

export const SetPlayerRotation = ServerBoundPacketCreator(
    0x19,
    'PlayerRotation',
    {
        yaw: DataFloat,
        pitch: DataFloat,
        onGround: DataBoolean,
    }
)

export const SetPlayerOnGround = ServerBoundPacketCreator(
    0x1a,
    'PlayerOnGround',
    {
        onGround: DataBoolean,
    }
)

export const MoveVehicle = ServerBoundPacketCreator(0x1b, 'MoveVehicle', {
    x: DataDouble,
    y: DataDouble,
    z: DataDouble,
    yaw: DataFloat,
    pitch: DataFloat,
})

export const PaddleBoat = ServerBoundPacketCreator(0x1c, 'PaddleBoat', {
    leftPaddle: DataBoolean,
    rightPaddle: DataBoolean,
})

export const PickItem = ServerBoundPacketCreator(0x1d, 'PickItem', {
    slotToUse: VarInt,
})

export const PingRequest = ServerBoundPacketCreator(0x1e, 'PingRequest', {
    payload: DataLong,
})

enum ActionStatus {
    STARTED_DIGGING = 0,
    CANCELLED_DIGGING,
    FINISHED_DIGGING,
    DROP_ITEM_STACK,
    DROP_ITEM,
    SHOOT_ARROW_OR_FINISH_EATING,
    SWAP_ITEM_IN_HAND,
}

enum Face {
    BOTTOM = 0,
    TOP,
    NORTH,
    SOUTH,
    WEST,
    EAST,
}

export const PlayerAction = ServerBoundPacketCreator(0x21, 'PlayerAction', {
    status: VarInt as Type<ActionStatus>,
    location: DataPosition,
    face: DataByte as Type<Face>,
    sequence: VarInt,
})

enum PlayerCommandAction {
    START_SNEAKING = 0,
    STOP_SNEAKING,
    LEAVE_BED,
    START_SPRINTING,
    STOP_SPRINTING,
    START_HORSE_JUMP,
    STOP_HORSE_JUMP,
    OPEN_VEHICLE_INVENTORY,
    START_FLYING_WITH_ELYTRA,
}

export const PlayerCommand = ServerBoundPacketCreator(0x22, 'PlayerCommand', {
    entity: VarInt as Type<EntityId>,
    action: VarInt as Type<PlayerCommandAction>,
    jump_boost: VarInt,
})

export const PlayPong = ServerBoundPacketCreator(0x24, 'Pong', {
    id: DataInt,
})

export const SetHeldItem = ServerBoundPacketCreator(0x2c, 'SetHeldItem', {
    slot: DataShort,
})

enum Hand {
    MAIN_HAND = 0,
    OFF_HAND,
}

export const SwingHand = ServerBoundPacketCreator(0x33, 'SwingHand', {
    hand: VarInt as Type<Hand>,
})

export const TeleportToEntity = ServerBoundPacketCreator(
    0x34,
    'TeleportToEntity',
    {
        target: DataUUID,
    }
)
