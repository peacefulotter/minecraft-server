import { DataByteArray, VarInt } from '~/data-types/basic'
import { ClientBoundPacketCreator, type ClientBoundPacket } from '../create'

const ResponseFormat = {
    packetLen: VarInt,
    id: VarInt,
    data: DataByteArray,
}

export const wrap = (packet: ClientBoundPacket) => {
    const creator = ClientBoundPacketCreator(
        packet.id,
        packet.name,
        ResponseFormat
    )

    const packetLen = packet.data.length + VarInt.write(packet.id).length

    return creator({
        packetLen,
        ...packet,
    })
}
