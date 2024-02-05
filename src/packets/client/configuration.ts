import {
    DataBoolean,
    DataByteArray,
    DataInt,
    DataLong,
    Optional,
    DataString,
    DataUUID,
    VarInt,
} from '~/data-types/basic'
import { createClientBoundPacket } from '../create'
import { NBTCompoundTag } from '~/data-types/registry'

export const ConfigurationPluginMessage = createClientBoundPacket(0x00, {
    channel: DataString,
    data: DataByteArray,
})

export const DisconnectConfiguration = createClientBoundPacket(0x01, {
    reason: DataString, // TODO: This is a chat component
})

export const FinishConfiguration = createClientBoundPacket(0x02, {})

export const ConfigurationKeepAlive = createClientBoundPacket(0x03, {
    id: DataLong,
})

export const ConfigurationPing = createClientBoundPacket(0x04, {
    id: DataInt,
})

export const RegistryData = createClientBoundPacket(0x05, {
    codec: NBTCompoundTag,
})

export const ConfigurationRemoveResourcePack = createClientBoundPacket(0x06, {
    hasUUID: DataBoolean,
    uuid: Optional(DataUUID),
})

export const ConfigurationAddResourcePack = createClientBoundPacket(0x07, {
    uuid: DataUUID,
    url: DataString,
    hash: DataString,
    forced: DataBoolean,
    hasPromptMessage: DataBoolean,
    promptMessage: Optional(DataString), // TODO: This is a chat component
})

export const FeatureFlags = createClientBoundPacket(0x08, {
    totalFeatures: VarInt,
    featureFlags: DataByteArray, // TODO: Array<FeatureFlags>
})
