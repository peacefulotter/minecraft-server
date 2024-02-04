import {
    VarInt,
    type Type,
    Byte,
    Float,
    String,
    Boolean,
    Long,
    Double,
    Int,
    Short,
    UUID,
} from '~/types/basic'
import { ServerBoundPacket } from '../create'
import type { Difficulty } from '~/types/enum'

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
        difficulty: Byte as Type<Difficulty>,
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
        chunkPerTick: Float,
    }
)

export const ClientStatus = new ServerBoundPacket(0x08, 'ClientStatus', {
    actionId: VarInt as Type<0 | 1>,
})

export const PlayClientInformation = new ServerBoundPacket(
    0x09,
    'ClientInformation',
    {
        locale: String,
        viewDistance: Byte,
        chatMode: VarInt,
        chatColors: Byte,
        displayedSkinParts: Byte,
        mainHand: VarInt,
        enableTextFiltering: Boolean,
        allowServerListings: Boolean,
    }
)

export const PlayKeepAlive = new ServerBoundPacket(0x15, 'KeepAlive', {
    id: Long,
})

export const SetPlayerPosition = new ServerBoundPacket(
    0x17,
    'SetPlayerPosition',
    {
        x: Double,
        y: Double,
        z: Double,
        onGround: Boolean,
    }
)

export const PlayerPositionAndRotation = new ServerBoundPacket(
    0x18,
    'PlayerPositionAndRotation',
    {
        x: Double,
        y: Double,
        z: Double,
        yaw: Float,
        pitch: Float,
        onGround: Boolean,
    }
)

export const PlayerRotation = new ServerBoundPacket(0x19, 'PlayerRotation', {
    yaw: Float,
    pitch: Float,
    onGround: Boolean,
})

export const PlayerOnGround = new ServerBoundPacket(0x1a, 'PlayerOnGround', {
    onGround: Boolean,
})

export const MoveVehicle = new ServerBoundPacket(0x1b, 'MoveVehicle', {
    x: Double,
    y: Double,
    z: Double,
    yaw: Float,
    pitch: Float,
})

export const PaddleBoat = new ServerBoundPacket(0x1c, 'PaddleBoat', {
    leftPaddle: Boolean,
    rightPaddle: Boolean,
})

export const PickItem = new ServerBoundPacket(0x1d, 'PickItem', {
    slotToUse: VarInt,
})

export const PingRequest = new ServerBoundPacket(0x1e, 'PingRequest', {
    payload: Long,
})

export const PlayPong = new ServerBoundPacket(0x24, 'Pong', {
    id: Int,
})

export const SetHeldItem = new ServerBoundPacket(0x2c, 'SetHeldItem', {
    slot: Short,
})

export const TeleportToEntity = new ServerBoundPacket(
    0x34,
    'TeleportToEntity',
    {
        target: UUID,
    }
)
