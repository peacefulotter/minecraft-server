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
    UUID,
} from '~/types/basic'
import { createReadPacket, type ServerBoundPacket } from './create'
import { log } from '~/logger'

const UnwrapSingle = (buffer: number[]) => {
    // Handle legacy server list ping
    console.log(
        'Unwrapping single',
        buffer[0],
        PacketNameToId.legacy_server_list_ping
    )

    if (buffer[0] == PacketNameToId.legacy_server_list_ping) {
        return {
            packetLen: buffer.length,
            packetId: PacketNameToId.legacy_server_list_ping as PacketId,
            buffer,
        }
    }

    const packetLen = VarInt.read(buffer)
    const packetId = VarInt.read(buffer) as PacketId
    const newBuffer = buffer.slice(0, packetLen - 1) // - 1 to account for the packet id
    console.log('Unwrapping single', { packetLen, packetId, newBuffer })
    return { packetId, buffer: newBuffer, packetLen }
}

export const Unwrap = (data: Buffer) => {
    let buffer = data.toJSON().data

    log('Unwrapping', data)

    const packets: { packetId: PacketId; buffer: number[] }[] = []
    while (buffer.length > 0) {
        const { packetId, buffer: newBuffer, packetLen } = UnwrapSingle(buffer)
        if (packetLen > 0) {
            packets.push({ packetId, buffer: newBuffer })
            buffer = buffer.slice(packetLen - 1)
        }
    }
    log('Unwrapping', packets)

    return packets
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
    hostname: String,
    port: Short,
    nextState: VarInt as Type<ClientState.STATUS | ClientState.LOGIN>,
})

export const LoginStart = createReadPacket({
    username: String,
    uuid: UUID,
})

export const EncryptionResponse = createReadPacket({
    sharedSecret: VarIntPrefixedByteArray,
    verifyToken: VarIntPrefixedByteArray,
})
