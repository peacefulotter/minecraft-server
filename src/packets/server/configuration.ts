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
import { ServerBoundPacket, type ParsedServerBoundPacket } from '../create'

export const ConfigurationClientInformation = new ServerBoundPacket(
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

export type ClientInfo = ParsedServerBoundPacket<
    typeof ConfigurationClientInformation
>

export const PluginMessage = new ServerBoundPacket(
    0x01,
    'PluginMessage' as const,
    {
        channel: DataString as Type<PluginChannel>,
        data: DataByteArray,
    }
)

export const FinishConfiguration = new ServerBoundPacket(
    0x02,
    'FinishConfiguration',
    {}
)

export const KeepAlive = new ServerBoundPacket(0x03, 'KeepAlive', {
    id: DataLong,
})

export const Pong = new ServerBoundPacket(0x04, 'Pong', {
    id: DataInt,
})

export const ResourcePackResponse = new ServerBoundPacket(
    0x05,
    'ResourcePackResponse',
    {
        uuid: DataUUID,
        result: VarInt as Type<ResourcePackResult>,
    }
)
