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
    DataNBT,
} from '~/data/types'
import type { FeatureFlags } from '~/data/enum'
import { ClientBoundPacketCreator } from '../create'

export const ConfigurationPluginMessage = new ClientBoundPacketCreator(
    0x00,
    'ConfigurationPluginMessage',
    {
        channel: new DataString(),
        data: new DataByteArray(),
    }
)

export const DisconnectConfiguration = new ClientBoundPacketCreator(
    0x01,
    'DisconnectConfiguration',
    {
        reason: new DataString(), // TODO: This is a chat component
    }
)

export const FinishConfiguration = new ClientBoundPacketCreator(
    0x02,
    'FinishConfiguration',
    {}
)

export const ConfigurationClientBoundKeepAlive = new ClientBoundPacketCreator(
    0x03,
    'ConfigurationKeepAlive',
    {
        id: new DataLong(),
    }
)

export const ConfigurationPing = new ClientBoundPacketCreator(
    0x04,
    'ConfigurationPing',
    {
        id: new DataInt(),
    }
)

export const RegistryData = new ClientBoundPacketCreator(0x05, 'RegistryData', {
    codec: new DataNBT(),
})

export const ConfigurationRemoveResourcePack = new ClientBoundPacketCreator(
    0x06,
    'ConfigurationRemoveResourcePack',
    {
        uuid: new DataOptional(new DataUUID()),
    }
)

export const ConfigurationAddResourcePack = new ClientBoundPacketCreator(
    0x07,
    'ConfigurationAddResourcePack',
    {
        uuid: new DataUUID(),
        url: new DataString(),
        hash: new DataString(),
        forced: new DataBoolean(),
        promptMessage: new DataOptional(new DataString()), // TODO: This is a chat component
    }
)

export const ConfigurationFeatureFlags = new ClientBoundPacketCreator(
    0x08,
    'ConfigurationFeatureFlags',
    {
        featureFlags: new DataArray(new DataString() as Type<FeatureFlags>),
    }
)
