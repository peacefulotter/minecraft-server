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
    DataUnsignedByte,
    DataSlot,
    DataInteract,
} from '~/net/types'
import { ServerBoundPacketCreator } from '../create'
import type {
    ActionStatus,
    Difficulty,
    Face,
    MainHand,
    PlayerCommandAction,
} from '~/data/enum'
import type { EntityId } from '~/entity'
import type { IntRange } from 'type-fest'

export const ConfirmTeleportation = new ServerBoundPacketCreator(
    0x00,
    'ConfirmTeleportation',
    {
        id: new VarInt(),
    }
)

// export const QueryBlockEntityTag =  new ServerBoundPacket(0x01, {
//     transactionId: new VarInt,
//     location: Position,
// })

export const ChangeDifficulty = new ServerBoundPacketCreator(
    0x02,
    'ChangeDifficulty',
    {
        difficulty: new DataByte() as Type<Difficulty>,
    }
)

export const AcknowledgeMessage = new ServerBoundPacketCreator(
    0x03,
    'AcknowledgeMessage',
    {
        id: new VarInt(),
    }
)

export const ChatCommand = new ServerBoundPacketCreator(0x04, 'ChatCommand', {
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

export const ChatMessage = new ServerBoundPacketCreator(0x05, 'ChatMessage', {
    message: new DataString(),
    timestamp: new DataLong(),
    salt: new DataLong(),
    signature: new DataOptional(new DataByteArray(256)),
    messageCount: new VarInt(),
    acknowledged: new DataFixedBitSet(20),
})

export const PlayerSession = new ServerBoundPacketCreator(
    0x06,
    'PlayerSession',
    {
        // TODO: Implement
    }
)

export const ChunkBatchReceived = new ServerBoundPacketCreator(
    0x07,
    'ChunkBatchReceived',
    {
        chunkPerTick: new DataFloat(),
    }
)

export const ClientStatus = new ServerBoundPacketCreator(0x08, 'ClientStatus', {
    actionId: new VarInt() as Type<0 | 1>,
})

export const PlayClientInformation = new ServerBoundPacketCreator(
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

export const ClickContainerButton = new ServerBoundPacketCreator(
    0x0c,
    'ClickContainerButton',
    {
        windowId: new DataUnsignedByte(),
        buttonId: new DataUnsignedByte(),
    }
)

type ClickContainerAction<
    Mode extends number,
    Button extends number,
    Slot extends number
> = {
    slot: Type<Slot>
    button: Type<Button>
    mode: Type<Mode>
}

type ClickContainerActions =
    | ClickContainerAction<0, 0 | 1, -999 | number>
    | ClickContainerAction<1, 0 | 1, number>
    | ClickContainerAction<2, IntRange<0, 40>, number>
    | ClickContainerAction<3, 2, number>
    | ClickContainerAction<4, 0 | 1, number>
    | ClickContainerAction<5, Exclude<IntRange<0, 10>, 3 | 7>, -999 | number>
    | ClickContainerAction<6, 0 | 1, number>

export const ClickContainer = new ServerBoundPacketCreator(
    0x0d,
    'ClickContainer',
    {
        windowId: new DataUnsignedByte(),
        stateId: new VarInt(),
        action: new DataObject({
            slot: new DataShort(),
            button: new DataByte(),
            mode: new VarInt(),
        } as ClickContainerActions),
        changedSlots: new DataArray(
            new DataObject({
                slot: new DataShort(),
                item: new DataSlot(),
            })
        ),
        carriedItem: new DataSlot(),
    }
)

export const CloseContainer = new ServerBoundPacketCreator(
    0x0e,
    'CloseContainer',
    {
        windowId: new DataUnsignedByte(),
    }
)

export const ChangeContainerSlotState = new ServerBoundPacketCreator(
    0x0f,
    'ChangeContainerSlotState',
    {
        slotId: new VarInt(),
        windowId: new VarInt(),
        state: new DataBoolean(),
    }
)

export const Interact = new ServerBoundPacketCreator(0x13, 'Interact', {
    interact: new DataInteract(),
})

export const JigsawGenerate = new ServerBoundPacketCreator(
    0x14,
    'JigsawGenerate',
    {
        location: new DataPosition(),
        levels: new VarInt(),
        keepJigsaws: new DataBoolean(),
    }
)

export const PlayServerBoundKeepAlive = new ServerBoundPacketCreator(
    0x15,
    'KeepAlive',
    {
        id: new DataLong(),
    },
    false
)

export const SetPlayerPosition = new ServerBoundPacketCreator(
    0x17,
    'SetPlayerPosition',
    {
        x: new DataDouble(),
        y: new DataDouble(),
        z: new DataDouble(),
        onGround: new DataBoolean(),
    },
    false
)

export const SetPlayerPositionAndRotation = new ServerBoundPacketCreator(
    0x18,
    'PlayerPositionAndRotation',
    {
        x: new DataDouble(),
        y: new DataDouble(),
        z: new DataDouble(),
        yaw: new DataFloat(),
        pitch: new DataFloat(),
        onGround: new DataBoolean(),
    },
    false
)

export const SetPlayerRotation = new ServerBoundPacketCreator(
    0x19,
    'PlayerRotation',
    {
        yaw: new DataFloat(),
        pitch: new DataFloat(),
        onGround: new DataBoolean(),
    },
    false
)

export const SetPlayerOnGround = new ServerBoundPacketCreator(
    0x1a,
    'PlayerOnGround',
    {
        onGround: new DataBoolean(),
    },
    false
)

export const MoveVehicle = new ServerBoundPacketCreator(0x1b, 'MoveVehicle', {
    x: new DataDouble(),
    y: new DataDouble(),
    z: new DataDouble(),
    yaw: new DataFloat(),
    pitch: new DataFloat(),
})

export const PaddleBoat = new ServerBoundPacketCreator(0x1c, 'PaddleBoat', {
    leftPaddle: new DataBoolean(),
    rightPaddle: new DataBoolean(),
})

export const PickItem = new ServerBoundPacketCreator(0x1d, 'PickItem', {
    slotToUse: new VarInt(),
})

export const PingRequest = new ServerBoundPacketCreator(0x1e, 'PingRequest', {
    payload: new DataLong(),
})

export const PlayerAbilities = new ServerBoundPacketCreator(
    0x20,
    'PlayerAbilities',
    {
        flags: new DataByte(),
    }
)

export const PlayerAction = new ServerBoundPacketCreator(0x21, 'PlayerAction', {
    status: new VarInt() as Type<ActionStatus>,
    location: new DataPosition(),
    face: new DataByte() as Type<Face>,
    sequence: new VarInt(),
})

export const PlayerCommand = new ServerBoundPacketCreator(
    0x22,
    'PlayerCommand',
    {
        entity: new VarInt() as Type<EntityId>,
        action: new VarInt() as Type<PlayerCommandAction>,
        jump_boost: new VarInt(),
    }
)

export const PlayPong = new ServerBoundPacketCreator(0x24, 'Pong', {
    id: new DataInt(),
})

export const SetHeldItem = new ServerBoundPacketCreator(0x2c, 'SetHeldItem', {
    slot: new DataShort(),
})

export const SetCreativeModeSlot = new ServerBoundPacketCreator(
    0x2f,
    'SetCreativeModeSlot',
    {
        slot: new DataShort(),
        item: new DataSlot(),
    }
)

export const SwingHand = new ServerBoundPacketCreator(0x33, 'SwingHand', {
    hand: new VarInt() as Type<MainHand>,
})

export const TeleportToEntity = new ServerBoundPacketCreator(
    0x34,
    'TeleportToEntity',
    {
        target: new DataUUID(),
    }
)

export const UseItemOn = new ServerBoundPacketCreator(0x35, 'UseItemOn', {
    hand: new VarInt() as Type<MainHand>,
    location: new DataPosition(),
    face: new DataByte(),
    cursorX: new DataFloat(),
    cursorY: new DataFloat(),
    cursorZ: new DataFloat(),
    insideBlock: new DataBoolean(),
    sequence: new VarInt(), // https://wiki.vg/Protocol#Acknowledge_Block_Change
})

export const UseItem = new ServerBoundPacketCreator(0x36, 'UseItem', {
    hand: new VarInt() as Type<MainHand>,
    sequence: new VarInt(), // https://wiki.vg/Protocol#Acknowledge_Block_Change
})
