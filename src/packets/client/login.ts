import {
    DataString,
    DataUUID,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/data-types/basic'
import { ClientBoundPacketCreator } from '../create'

export const EncryptionRequest = new ClientBoundPacketCreator(
    0x01,
    'EncryptionRequest',
    {
        serverId: DataString,
        publicKey: VarIntPrefixedByteArray,
        verifyToken: VarIntPrefixedByteArray,
    }
)

export const LoginSuccess = new ClientBoundPacketCreator(0x02, 'LoginSuccess', {
    uuid: DataUUID,
    username: DataString,
    numberOfProperties: VarInt,
})
