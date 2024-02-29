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
    DataFixedBitSet,
    DataOptional,
} from '~/data/types'
import { ServerBoundPacketCreator } from '../create'
import type { Difficulty } from '~/data/enum'
import type { EntityId } from '~/entity/entity'

export const ConfirmTeleportation = ServerBoundPacketCreator(
    0x00,
    'ConfirmTeleportation',
    {
        id: new VarInt(),
    }
)

// export const QueryBlockEntityTag =  ServerBoundPacket(0x01, {
//     transactionId: new VarInt,
//     location: Position,
// })

export const ChangeDifficulty = ServerBoundPacketCreator(
    0x02,
    'ChangeDifficulty',
    {
        difficulty: new DataByte() as Type<Difficulty>,
    }
)

export const AcknowledgeMessage = ServerBoundPacketCreator(
    0x03,
    'AcknowledgeMessage',
    {
        id: new VarInt(),
    }
)

export const ChatCommand = ServerBoundPacketCreator(0x04, 'ChatCommand', {
    command: new DataString(),
    timestamp: new DataLong(),
    salt: new DataLong(),
    args: new DataArray(
        new DataObject({
            name: new DataString(),
            signature: new DataByteArray(256),
        })
    ),
    messageCount: new VarInt(),
    acknowledged: new DataFixedBitSet(20),
})

export const ChatMessage = ServerBoundPacketCreator(0x05, 'ChatMessage', {
    message: new DataString(),
    timestamp: new DataLong(),
    salt: new DataLong(),
    signature: new DataOptional(new DataByteArray(256)),
    messageCount: new VarInt(),
    acknowledged: new DataFixedBitSet(20),
})

export const PlayerSession = ServerBoundPacketCreator(0x06, 'PlayerSession', {
    // TODO: Implement
})

export const ChunkBatchReceived = ServerBoundPacketCreator(
    0x07,
    'ChunkBatchReceived',
    {
        chunkPerTick: new DataFloat(),
    }
)

export const ClientStatus = ServerBoundPacketCreator(0x08, 'ClientStatus', {
    actionId: new VarInt() as Type<0 | 1>,
})

export const PlayClientInformation = ServerBoundPacketCreator(
    0x09,
    'ClientInformation',
    {
        locale: new DataString(),
        viewDistance: new DataByte(),
        chatMode: new VarInt(),
        chatColors: new DataByte(),
        displayedSkinParts: new DataByte(),
        mainHand: new VarInt(),
        enableTextFiltering: new DataBoolean(),
        allowServerListings: new DataBoolean(),
    }
)

export const PlayServerBoundKeepAlive = ServerBoundPacketCreator(
    0x15,
    'KeepAlive',
    {
        id: new DataLong(),
    }
)

export const SetPlayerPosition = ServerBoundPacketCreator(
    0x17,
    'SetPlayerPosition',
    {
        x: new DataDouble(),
        y: new DataDouble(),
        z: new DataDouble(),
        onGround: new DataBoolean(),
    }
)

export const SetPlayerPositionAndRotation = ServerBoundPacketCreator(
    0x18,
    'PlayerPositionAndRotation',
    {
        x: new DataDouble(),
        y: new DataDouble(),
        z: new DataDouble(),
        yaw: new DataFloat(),
        pitch: new DataFloat(),
        onGround: new DataBoolean(),
    }
)

export const SetPlayerRotation = ServerBoundPacketCreator(
    0x19,
    'PlayerRotation',
    {
        yaw: new DataFloat(),
        pitch: new DataFloat(),
        onGround: new DataBoolean(),
    }
)

export const SetPlayerOnGround = ServerBoundPacketCreator(
    0x1a,
    'PlayerOnGround',
    {
        onGround: new DataBoolean(),
    }
)

export const MoveVehicle = ServerBoundPacketCreator(0x1b, 'MoveVehicle', {
    x: new DataDouble(),
    y: new DataDouble(),
    z: new DataDouble(),
    yaw: new DataFloat(),
    pitch: new DataFloat(),
})

export const PaddleBoat = ServerBoundPacketCreator(0x1c, 'PaddleBoat', {
    leftPaddle: new DataBoolean(),
    rightPaddle: new DataBoolean(),
})

export const PickItem = ServerBoundPacketCreator(0x1d, 'PickItem', {
    slotToUse: new VarInt(),
})

export const PingRequest = ServerBoundPacketCreator(0x1e, 'PingRequest', {
    payload: new DataLong(),
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
    status: new VarInt() as Type<ActionStatus>,
    location: new DataPosition(),
    face: new DataByte() as Type<Face>,
    sequence: new VarInt(),
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
    entity: new VarInt() as Type<EntityId>,
    action: new VarInt() as Type<PlayerCommandAction>,
    jump_boost: new VarInt(),
})

export const PlayPong = ServerBoundPacketCreator(0x24, 'Pong', {
    id: new DataInt(),
})

export const SetHeldItem = ServerBoundPacketCreator(0x2c, 'SetHeldItem', {
    slot: new DataShort(),
})

enum Hand {
    MAIN_HAND = 0,
    OFF_HAND,
}

export const SwingHand = ServerBoundPacketCreator(0x33, 'SwingHand', {
    hand: new VarInt() as Type<Hand>,
})

export const TeleportToEntity = ServerBoundPacketCreator(
    0x34,
    'TeleportToEntity',
    {
        target: new DataUUID(),
    }
)
