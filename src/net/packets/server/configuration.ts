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
} from '~/data/types'
import type {
    ChatMode,
    MainHand,
    PluginChannel,
    ResourcePackResult,
} from '~/data/enum'
import {
    ServerBoundPacketCreator,
    type ServerBoundPacketDataFromCreator,
} from '../create'

export const ConfigurationClientInformation = new ServerBoundPacketCreator(
    0x00,
    'ClientInformation' as const,
    {
        locale: new DataString(),
        viewDistance: new DataByte(),
        chatMode: new VarInt(),
        chatColors: new DataByte() as Type<ChatMode>,
        displayedSkinParts: new DataByte(),
        mainHand: new VarInt() as Type<MainHand>,
        enableTextFiltering: new DataBoolean(),
        allowServerListings: new DataBoolean(),
    }
)

export type ClientInfo = ServerBoundPacketDataFromCreator<
    typeof ConfigurationClientInformation
>

export const PluginMessage = new ServerBoundPacketCreator(
    0x01,
    'PluginMessage' as const,
    {
        channel: new DataString() as Type<PluginChannel>,
        data: new DataString(), // TODO support DataByteArray https://wiki.vg/Plugin_channels
    }
)

export const FinishConfiguration = new ServerBoundPacketCreator(
    0x02,
    'FinishConfiguration',
    {}
)

export const ConfigurationServerBoundKeepAlive = new ServerBoundPacketCreator(
    0x03,
    'KeepAlive',
    {
        id: new DataLong(),
    }
)

export const Pong = new ServerBoundPacketCreator(0x04, 'Pong', {
    id: new DataInt(),
})

export const ResourcePackResponse = new ServerBoundPacketCreator(
    0x05,
    'ResourcePackResponse',
    {
        uuid: new DataUUID(),
        result: new VarInt() as Type<ResourcePackResult>,
    }
)
