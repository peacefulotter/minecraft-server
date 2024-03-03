import {
    DataArray,
    DataObject,
    DataString,
    DataUUID,
    DataOptional,
    VarIntPrefixedByteArray,
} from '~/data/types'
import { ClientBoundPacketCreator } from '../create'

export const EncryptionRequest = new ClientBoundPacketCreator(
    0x01,
    'EncryptionRequest',
    {
        serverId: new DataString(),
        publicKey: new VarIntPrefixedByteArray(),
        verifyToken: new VarIntPrefixedByteArray(),
    }
)

export const LoginSuccess = new ClientBoundPacketCreator(0x02, 'LoginSuccess', {
    uuid: new DataUUID(),
    username: new DataString(),
    properties: new DataArray(
        new DataObject({
            name: new DataString(),
            value: new DataString(),
            signature: new DataOptional(new DataString()),
        })
    ),
})
