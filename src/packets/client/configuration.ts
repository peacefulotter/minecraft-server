import {
    DataBoolean,
    DataByteArray,
    DataInt,
    DataLong,
    Optional,
    DataString,
    DataUUID,
    VarInt,
    DataArray,
    type Type,
} from '~/data-types/basic'
import { createClientBoundPacket } from '../create'
import { NBTCompoundTag } from '~/data-types/registry'
import type { FeatureFlags } from '~/data-types/enum'

export const ConfigurationPluginMessage = createClientBoundPacket(
    0x00,
    'ConfigurationPluginMessage',
    {
        channel: DataString,
        data: DataByteArray,
    }
)

export const DisconnectConfiguration = createClientBoundPacket(
    0x01,
    'DisconnectConfiguration',
    {
        reason: DataString, // TODO: This is a chat component
    }
)

export const FinishConfiguration = createClientBoundPacket(
    0x02,
    'FinishConfiguration',
    {}
)

export const ConfigurationKeepAlive = createClientBoundPacket(
    0x03,
    'ConfigurationKeepAlive',
    {
        id: DataLong,
    }
)

export const ConfigurationPing = createClientBoundPacket(
    0x04,
    'ConfigurationPing',
    {
        id: DataInt,
    }
)

export const RegistryData = createClientBoundPacket(0x05, 'RegistryData', {
    codec: NBTCompoundTag,
})

export const ConfigurationRemoveResourcePack = createClientBoundPacket(
    0x06,
    'ConfigurationRemoveResourcePack',
    {
        hasUUID: DataBoolean,
        uuid: Optional(DataUUID),
    }
)

export const ConfigurationAddResourcePack = createClientBoundPacket(
    0x07,
    'ConfigurationAddResourcePack',
    {
        uuid: DataUUID,
        url: DataString,
        hash: DataString,
        forced: DataBoolean,
        hasPromptMessage: DataBoolean,
        promptMessage: Optional(DataString), // TODO: This is a chat component
    }
)

export const ConfigurationFeatureFlags = createClientBoundPacket(
    0x08,
    'ConfigurationFeatureFlags',
    {
        featureFlags: DataArray(DataString as Type<FeatureFlags>),
    }
)
