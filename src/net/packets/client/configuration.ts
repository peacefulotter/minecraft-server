import {
    DataBoolean,
    DataByteArray,
    DataInt,
    DataLong,
    DataOptional,
    DataString,
    DataUUID,
    DataArray,
    type Type,
} from '~/data-types/basic'
import { DataNBT } from '~/data-types/registry'
import type { FeatureFlags } from '~/data-types/enum'
import { ClientBoundPacketCreator } from '../create'

export const ConfigurationPluginMessage = ClientBoundPacketCreator(
    0x00,
    'ConfigurationPluginMessage',
    {
        channel: DataString,
        data: DataByteArray,
    }
)

export const DisconnectConfiguration = ClientBoundPacketCreator(
    0x01,
    'DisconnectConfiguration',
    {
        reason: DataString, // TODO: This is a chat component
    }
)

export const FinishConfiguration = ClientBoundPacketCreator(
    0x02,
    'FinishConfiguration',
    {}
)

export const ConfigurationClientBoundKeepAlive = ClientBoundPacketCreator(
    0x03,
    'ConfigurationKeepAlive',
    {
        id: DataLong,
    }
)

export const ConfigurationPing = ClientBoundPacketCreator(
    0x04,
    'ConfigurationPing',
    {
        id: DataInt,
    }
)

export const RegistryData = ClientBoundPacketCreator(0x05, 'RegistryData', {
    codec: DataNBT,
})

export const ConfigurationRemoveResourcePack = ClientBoundPacketCreator(
    0x06,
    'ConfigurationRemoveResourcePack',
    {
        uuid: DataOptional(DataUUID),
    }
)

export const ConfigurationAddResourcePack = ClientBoundPacketCreator(
    0x07,
    'ConfigurationAddResourcePack',
    {
        uuid: DataUUID,
        url: DataString,
        hash: DataString,
        forced: DataBoolean,
        promptMessage: DataOptional(DataString), // TODO: This is a chat component
    }
)

export const ConfigurationFeatureFlags = ClientBoundPacketCreator(
    0x08,
    'ConfigurationFeatureFlags',
    {
        featureFlags: DataArray(DataString as Type<FeatureFlags>),
    }
)
