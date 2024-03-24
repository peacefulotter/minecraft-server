import { DataString, DataUUID, VarIntPrefixedByteArray } from '~/net/types'
import { ServerBoundPacketCreator } from '../create'

export const LoginStart = new ServerBoundPacketCreator(0x00, 'LoginStart', {
    username: new DataString(),
    uuid: new DataUUID(),
})

export const EncryptionResponse = new ServerBoundPacketCreator(
    0x01,
    'EncryptionResponse',
    {
        sharedSecret: new VarIntPrefixedByteArray(),
        verifyToken: new VarIntPrefixedByteArray(),
    }
)

export const LoginPluginResponse = new ServerBoundPacketCreator(
    0x02,
    'LoginPluginResponse',
    {
        // TODO: Implement
    }
)

export const LoginAcknowledged = new ServerBoundPacketCreator(
    0x03,
    'LoginAcknowledged',
    {
        // TODO: Implement
    }
)
