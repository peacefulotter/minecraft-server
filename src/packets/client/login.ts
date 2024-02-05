import {
    DataString,
    DataUUID,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/data-types/basic'
import { createClientBoundPacket } from '../create'

export const EncryptionRequest = createClientBoundPacket(0x01, {
    serverId: DataString,
    publicKey: VarIntPrefixedByteArray,
    verifyToken: VarIntPrefixedByteArray,
})

export const LoginSuccess = createClientBoundPacket(0x02, {
    uuid: DataUUID,
    username: DataString,
    numberOfProperties: VarInt,
})
