import {
    Byte,
    String,
    VarInt,
    type Type,
    Boolean,
    ByteArray,
    Long,
    Int,
    UUID,
} from '~/types/basic'
import type { ChatMode, MainHand, ResourcePackResult } from '~/types/enum'
import { ServerBoundPacket, type ParsedServerBoundPacket } from '../create'

export const ClientInformation = new ServerBoundPacket(
    0x00,
    'ClientInformation' as const,
    {
        locale: String,
        viewDistance: Byte,
        chatMode: VarInt,
        chatColors: Byte as Type<ChatMode>,
        displayedSkinParts: Byte,
        mainHand: VarInt as Type<MainHand>,
        enableTextFiltering: Boolean,
        allowServerListings: Boolean,
    }
)

export type ClientInfo = ParsedServerBoundPacket<typeof ClientInformation>

export const PluginMessage = new ServerBoundPacket(
    0x01,
    'PluginMessage' as const,
    {
        channel: String, // TODO: Identifier type
        data: ByteArray,
    }
)

export const FinishConfiguration = new ServerBoundPacket(
    0x02,
    'FinishConfiguration',
    {}
)

export const KeepAlive = new ServerBoundPacket(0x03, 'KeepAlive', {
    id: Long,
})

export const Pong = new ServerBoundPacket(0x04, 'Pong', {
    id: Int,
})

export const ResourcePackResponse = new ServerBoundPacket(
    0x05,
    'ResourcePackResponse',
    {
        uuid: UUID,
        result: VarInt as Type<ResourcePackResult>,
    }
)
