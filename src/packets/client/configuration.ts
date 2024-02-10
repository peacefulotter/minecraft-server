import {
    DataBoolean,
    DataByteArray,
    DataInt,
    DataLong,
    Optional,
    DataString,
    DataUUID,
    DataArray,
    type Type,
} from '~/data-types/basic'
import { NBTCompoundTag } from '~/data-types/registry'
import type { FeatureFlags } from '~/data-types/enum'
import { ClientBoundPacketCreator } from '../create'

export const ConfigurationPluginMessage = new ClientBoundPacketCreator(
    0x00,
    'ConfigurationPluginMessage',
    {
        channel: DataString,
        data: DataByteArray,
    }
)

export const DisconnectConfiguration = new ClientBoundPacketCreator(
    0x01,
    'DisconnectConfiguration',
    {
        reason: DataString, // TODO: This is a chat component
    }
)

export const FinishConfiguration = new ClientBoundPacketCreator(
    0x02,
    'FinishConfiguration',
    {}
)

export const ConfigurationKeepAlive = new ClientBoundPacketCreator(
    0x03,
    'ConfigurationKeepAlive',
    {
        id: DataLong,
    }
)

export const ConfigurationPing = new ClientBoundPacketCreator(
    0x04,
    'ConfigurationPing',
    {
        id: DataInt,
    }
)

export const RegistryData = new ClientBoundPacketCreator(0x05, 'RegistryData', {
    codec: NBTCompoundTag,
})

export const ConfigurationRemoveResourcePack = new ClientBoundPacketCreator(
    0x06,
    'ConfigurationRemoveResourcePack',
    {
        uuid: Optional(DataUUID),
    }
)

export const ConfigurationAddResourcePack = new ClientBoundPacketCreator(
    0x07,
    'ConfigurationAddResourcePack',
    {
        uuid: DataUUID,
        url: DataString,
        hash: DataString,
        forced: DataBoolean,
        promptMessage: Optional(DataString), // TODO: This is a chat component
    }
)

export const ConfigurationFeatureFlags = new ClientBoundPacketCreator(
    0x08,
    'ConfigurationFeatureFlags',
    {
        featureFlags: DataArray(DataString as Type<FeatureFlags>),
    }
)
