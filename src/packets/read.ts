import type { ClientState } from '~/client'
import { PacketNameToId, type PacketId } from '~/packet'
import {
    type Type,
    Byte,
    Int,
    Short,
    String,
    VarInt,
    VarIntPrefixedByteArray,
} from '~/types/basic'
import { createReadPacket } from './create'

export const Unwrap = (data: Buffer) => {
    let buffer = data.toJSON().data
    const length = VarInt.read(buffer)

    // Handle legacy server list ping
    if (length == PacketNameToId.legacy_server_list_ping) {
        return {
            packetId: PacketNameToId.legacy_server_list_ping as PacketId,
            buffer,
        }
    } else buffer = buffer.slice(0, length)

    const packetId = VarInt.read(buffer) as PacketId
    return { packetId, buffer }
}

export const LegacyServerListPing = createReadPacket({
    fa: Byte, // fa
    // mcLen: Short, // 11
    mc: String, // MC|PingHost
    restLen: Short, // 7 + len(hostname)
    protocol: Byte,
    hostnameLen: Short, // len(hostname)
    hostname: String,
    port: Int, // TODO: check that this is indeed int and not varint
})

export const Handshake = createReadPacket({
    protocol: VarInt,
    hostnameLen: VarInt,
    hostname: String,
    port: Short,
    nextState: VarInt as Type<ClientState.STATUS | ClientState.LOGIN>,
})

export const EncryptionResponse = createReadPacket({
    sharedSecret: VarIntPrefixedByteArray,
    verifyToken: VarIntPrefixedByteArray,
})
