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
} from '~/data-types/basic'
import { ServerBoundPacket } from '../create'
import type { Difficulty } from '~/data-types/enum'

export const ConfirmTeleportation = new ServerBoundPacket(
    0x00,
    'ConfirmTeleportation',
    {
        id: VarInt,
    }
)

// export const QueryBlockEntityTag = new ServerBoundPacket(0x01, {
//     transactionId: VarInt,
//     location: Position,
// })

export const ChangeDifficulty = new ServerBoundPacket(
    0x02,
    'ChangeDifficulty',
    {
        difficulty: DataByte as Type<Difficulty>,
    }
)

export const AcknowledgeMessage = new ServerBoundPacket(
    0x03,
    'AcknowledgeMessage',
    {
        id: VarInt,
    }
)

// export const ChatCommand = new ServerBoundPacket(0x04,'ChatCommand', {
//     command: String,
//     timestamp: Long,
//     salt: Long,
//     arrayLength: VarInt,
//     array: Array<{
//         argName: String,
//         signature: ByteArray
//     }>
// })

export const ChatMessage = new ServerBoundPacket(0x05, 'ChatMessage', {
    // TODO: Implement
})

export const PlayerSession = new ServerBoundPacket(0x06, 'PlayerSession', {
    // TODO: Implement
})

export const ChunkBatchReceived = new ServerBoundPacket(
    0x07,
    'ChunkBatchReceived',
    {
        chunkPerTick: DataFloat,
    }
)

export const ClientStatus = new ServerBoundPacket(0x08, 'ClientStatus', {
    actionId: VarInt as Type<0 | 1>,
})

export const PlayClientInformation = new ServerBoundPacket(
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

export const PlayKeepAlive = new ServerBoundPacket(0x15, 'KeepAlive', {
    id: DataLong,
})

export const SetPlayerPosition = new ServerBoundPacket(
    0x17,
    'SetPlayerPosition',
    {
        x: DataDouble,
        y: DataDouble,
        z: DataDouble,
        onGround: DataBoolean,
    }
)

export const PlayerPositionAndRotation = new ServerBoundPacket(
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

export const PlayerRotation = new ServerBoundPacket(0x19, 'PlayerRotation', {
    yaw: DataFloat,
    pitch: DataFloat,
    onGround: DataBoolean,
})

export const PlayerOnGround = new ServerBoundPacket(0x1a, 'PlayerOnGround', {
    onGround: DataBoolean,
})

export const MoveVehicle = new ServerBoundPacket(0x1b, 'MoveVehicle', {
    x: DataDouble,
    y: DataDouble,
    z: DataDouble,
    yaw: DataFloat,
    pitch: DataFloat,
})

export const PaddleBoat = new ServerBoundPacket(0x1c, 'PaddleBoat', {
    leftPaddle: DataBoolean,
    rightPaddle: DataBoolean,
})

export const PickItem = new ServerBoundPacket(0x1d, 'PickItem', {
    slotToUse: VarInt,
})

export const PingRequest = new ServerBoundPacket(0x1e, 'PingRequest', {
    payload: DataLong,
})

export const PlayPong = new ServerBoundPacket(0x24, 'Pong', {
    id: DataInt,
})

export const SetHeldItem = new ServerBoundPacket(0x2c, 'SetHeldItem', {
    slot: DataShort,
})

export const TeleportToEntity = new ServerBoundPacket(
    0x34,
    'TeleportToEntity',
    {
        target: DataUUID,
    }
)
