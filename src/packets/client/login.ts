import {
    DataArray,
    DataObject,
    DataString,
    DataUUID,
    DataOptional,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/data-types/basic'
import { ClientBoundPacketCreator } from '../create'

export const EncryptionRequest = ClientBoundPacketCreator(
    0x01,
    'EncryptionRequest',
    {
        serverId: DataString,
        publicKey: VarIntPrefixedByteArray,
        verifyToken: VarIntPrefixedByteArray,
    }
)

export const LoginSuccess = ClientBoundPacketCreator(0x02, 'LoginSuccess', {
    uuid: DataUUID,
    username: DataString,
    properties: DataArray(
        DataObject({
            name: DataString,
            value: DataString,
            signature: DataOptional(DataString),
        })
    ),
})
