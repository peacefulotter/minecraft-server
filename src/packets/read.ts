import type { ClientState } from '~/client'
import { createReadPacket, formats } from '~/formats'
import { PacketNameToId, type PacketId } from '~/packet'

const { byte, bytes, int, varint, string, short } = formats.read

export const Unwrap = (data: Buffer) => {
    let buffer = data.toJSON().data
    const length = varint({ buffer, length: 0 })

    // Handle legacy server list ping
    if (length == PacketNameToId.legacy_server_list_ping) {
        return {
            packetId: PacketNameToId.legacy_server_list_ping as PacketId,
            buffer,
        }
    } else buffer = buffer.slice(0, length)

    const packetId = varint({ buffer, length: 0 }) as PacketId
    return { packetId, buffer }
}

export const LegacyServerListPing = createReadPacket({
    fa: byte, // fa
    mcLen: short, // 11
    mc: string, // MC|PingHost
    restLen: short, // 7 + len(hostname)
    protocol: byte,
    hostnameLen: short, // len(hostname)
    hostname: string,
    port: int, // TODO: check that this is indeed int and not varint
})

export const Handshake = createReadPacket({
    protocol: varint,
    hostnameLen: varint,
    hostname: string,
    port: short,
    // NOTE: custom varint to be able to cast the resulting varint to the proper type
    nextState: (args: { buffer: number[]; length: number }) =>
        varint(args) as ClientState.STATUS | ClientState.LOGIN,
})

export const EncryptionResponse = createReadPacket({
    sharedSecretLen: varint,
    sharedSecret: bytes,
    verifyTokenLen: varint,
    verifyToken: bytes,
})
