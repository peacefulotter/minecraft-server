import { createWritePacket, formats } from '~/formats'
import { PacketNameToId } from '~/packet'

const { string, varint, bytes } = formats.write

export const WrapPing = ({ packetLen, packet }: { packetLen: number; packet: Buffer }) =>
    createWritePacket({
        packetLen: varint,
        packetId: () => varint(PacketNameToId.ping),
        packet: bytes,
    })({
        packetLen,
        packetId: 0,
        packet,
    })

export const WrapResponse = createWritePacket({
    packetLen: varint,
    packetId: varint,
    bufferLen: varint,
    buffer: bytes,
})

export const EncryptionRequest = createWritePacket({
    serverIdLen: varint,
    serverId: string,
    publicKeyLen: varint,
    publicKey: bytes,
    verifyTokenLen: varint,
    verifyToken: bytes,
})
