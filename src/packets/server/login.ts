import { String, UUID, VarIntPrefixedByteArray } from '~/types/basic'
import { ServerBoundPacket } from '../create'

export const LoginStart = new ServerBoundPacket(0x00, 'LoginStart', {
    username: String,
    uuid: UUID,
})

export const EncryptionResponse = new ServerBoundPacket(
    0x01,
    'EncryptionResponse',
    {
        sharedSecret: VarIntPrefixedByteArray,
        verifyToken: VarIntPrefixedByteArray,
    }
)

export const LoginPluginResponse = new ServerBoundPacket(
    0x02,
    'LoginPluginResponse',
    {
        // TODO: Implement
    }
)

export const LoginAcknowledged = new ServerBoundPacket(
    0x03,
    'LoginAcknowledged',
    {
        // TODO: Implement
    }
)