import { createWritePacket } from './create'
import {
    ByteArray,
    String,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/types/basic'

export const WrapPing = createWritePacket({
    packetLen: VarInt,
    packetId: VarInt,
    packet: ByteArray,
})

export const WrapResponse = createWritePacket({
    packetLen: VarInt,
    packetId: VarInt,
    bufferLen: VarInt,
    buffer: ByteArray,
})

export const EncryptionRequest = createWritePacket({
    serverId: String,
    publicKey: VarIntPrefixedByteArray,
    verifyToken: VarIntPrefixedByteArray,
})
