import {
    DataByte,
    DataString,
    VarInt,
    type Type,
    DataBoolean,
    DataByteArray,
    DataLong,
    DataInt,
    DataUUID,
} from '~/data-types/basic'
import type {
    ChatMode,
    MainHand,
    PluginChannel,
    ResourcePackResult,
} from '~/data-types/enum'
import { type ServerBoundPacketData, ServerBoundPacketCreator } from '../create'

export const ConfigurationClientInformation = ServerBoundPacketCreator(
    0x00,
    'ClientInformation' as const,
    {
        locale: DataString,
        viewDistance: DataByte,
        chatMode: VarInt,
        chatColors: DataByte as Type<ChatMode>,
        displayedSkinParts: DataByte,
        mainHand: VarInt as Type<MainHand>,
        enableTextFiltering: DataBoolean,
        allowServerListings: DataBoolean,
    }
)

export type ClientInfo = ServerBoundPacketData<
    typeof ConfigurationClientInformation
>

export const PluginMessage = ServerBoundPacketCreator(
    0x01,
    'PluginMessage' as const,
    {
        channel: DataString as Type<PluginChannel>,
        data: DataByteArray,
    }
)

export const FinishConfiguration = ServerBoundPacketCreator(
    0x02,
    'FinishConfiguration',
    {}
)

export const KeepAlive = ServerBoundPacketCreator(0x03, 'KeepAlive', {
    id: DataLong,
})

export const Pong = ServerBoundPacketCreator(0x04, 'Pong', {
    id: DataInt,
})

export const ResourcePackResponse = ServerBoundPacketCreator(
    0x05,
    'ResourcePackResponse',
    {
        uuid: DataUUID,
        result: VarInt as Type<ResourcePackResult>,
    }
)
