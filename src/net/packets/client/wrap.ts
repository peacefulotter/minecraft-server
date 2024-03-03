import { DataByteArray, VarInt } from '~/data/types'
import { ClientBoundPacketCreator, type ClientBoundPacket } from '../create'

const ResponseFormat = {
    packetLen: new VarInt(),
    id: new VarInt(),
    data: new DataByteArray(),
}

export const wrap = async (packet: ClientBoundPacket) => {
    const { id, name, data } = packet

    const creator = new ClientBoundPacketCreator(id, name, ResponseFormat)

    const packetId = await VarInt.write(packet.id)
    const packetLen = data.length + packetId.length

    return creator.serialize({
        packetLen,
        id,
        data: data,
    })
}
