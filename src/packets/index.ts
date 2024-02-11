import { VarInt } from '~/data-types/basic'
import type { ClientBoundPacket } from './create'
import { type Client } from '~/client'
import { BundleDelimiter, WrapResponse } from './client'

export type PacketId = number

const format = async (packet: ClientBoundPacket, client: Client) => {
    const packetLen = packet.data.length + VarInt.write(packet.id).length
    return await WrapResponse({
        packetLen,
        ...packet,
    })
}

export const formatPacket = async (
    packet: ClientBoundPacket | ClientBoundPacket[],
    client: Client
) => {
    if (Array.isArray(packet)) {
        const delimiter = await BundleDelimiter({})
        const delimiterBuffer = await format(delimiter, client)
        const data = await Promise.all(packet.map((p) => format(p, client)))
        return {
            // id: packet.map((p) => p.id).join(' + '),
            name: packet.map((p) => p.name).join(' + '),
            data: Buffer.concat(
                data.map((d) => Buffer.concat([d.data, delimiterBuffer.data]))
            ),
        } as ClientBoundPacket
    }
    return format(packet, client)
}
