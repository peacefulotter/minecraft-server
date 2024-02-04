import { String, UUID, VarInt, VarIntPrefixedByteArray } from '~/types/basic'
import { createClientBoundPacket } from '../create'

export const EncryptionRequest = createClientBoundPacket(0x01, {
    serverId: String,
    publicKey: VarIntPrefixedByteArray,
    verifyToken: VarIntPrefixedByteArray,
})

export const LoginSuccess = createClientBoundPacket(0x02, {
    uuid: UUID,
    username: String,
    numberOfProperties: VarInt,
})
