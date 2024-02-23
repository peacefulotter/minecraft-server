import { DataByteArray, VarInt } from '~/data-types/basic'
import { ClientBoundPacketCreator, type ClientBoundPacket } from '../create'

const ResponseFormat = {
    packetLen: VarInt,
    id: VarInt,
    data: DataByteArray,
}

export const wrap = async (packet: ClientBoundPacket) => {
    const creator = ClientBoundPacketCreator(
        packet.id,
        packet.name,
        ResponseFormat
    )

    const packetId = await VarInt.write(packet.id)
    const packetLen = packet.data.length + packetId.length

    return creator({
        packetLen,
        ...packet,
    })
}
