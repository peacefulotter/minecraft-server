import { DataString, DataUUID, VarIntPrefixedByteArray } from '~/data/types'
import { ServerBoundPacketCreator } from '../create'

export const LoginStart = ServerBoundPacketCreator(0x00, 'LoginStart', {
    username: new DataString(),
    uuid: new DataUUID(),
})

export const EncryptionResponse = ServerBoundPacketCreator(
    0x01,
    'EncryptionResponse',
    {
        sharedSecret: new VarIntPrefixedByteArray(),
        verifyToken: new VarIntPrefixedByteArray(),
    }
)

export const LoginPluginResponse = ServerBoundPacketCreator(
    0x02,
    'LoginPluginResponse',
    {
        // TODO: Implement
    }
)

export const LoginAcknowledged = ServerBoundPacketCreator(
    0x03,
    'LoginAcknowledged',
    {
        // TODO: Implement
    }
)
