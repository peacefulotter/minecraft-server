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
import { ServerBoundPacketCreator } from '../create'
import type { Difficulty } from '~/data-types/enum'

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

// export const ChatCommand =  ServerBoundPacket(0x04,'ChatCommand', {
//     command: String,
//     timestamp: Long,
//     salt: Long,
//     arrayLength: VarInt,
//     array: Array<{
//         argName: String,
//         signature: ByteArray
//     }>
// })

export const ChatMessage = ServerBoundPacketCreator(0x05, 'ChatMessage', {
    // TODO: Implement
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

export const PlayKeepAlive = ServerBoundPacketCreator(0x15, 'KeepAlive', {
    id: DataLong,
})

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

export const PlayPong = ServerBoundPacketCreator(0x24, 'Pong', {
    id: DataInt,
})

export const SetHeldItem = ServerBoundPacketCreator(0x2c, 'SetHeldItem', {
    slot: DataShort,
})

export const TeleportToEntity = ServerBoundPacketCreator(
    0x34,
    'TeleportToEntity',
    {
        target: DataUUID,
    }
)
