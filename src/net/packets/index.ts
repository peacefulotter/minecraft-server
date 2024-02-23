import type { ClientBoundPacket } from './create'
import { BundleDelimiter, wrap } from './client'

export type PacketId = number

const getNames = (packets: ClientBoundPacket[]) => {
    const occurences = packets
        .map((p) => p.name)
        .reduce((acc, cur) => {
            if (cur in acc) {
                acc[cur]++
            } else {
                acc[cur] = 1
            }
            return acc
        }, {} as { [key: string]: number })

    return Object.entries(occurences)
        .reduce((acc, [name, count]) => {
            acc.push(`${name}` + (count > 1 ? `(x${count})` : ''))
            return acc
        }, [] as string[])
        .join(' | ')
}

export const formatPacket = async (
    packet: ClientBoundPacket | ClientBoundPacket[]
) => {
    if (Array.isArray(packet)) {
        // const delimiter = await BundleDelimiter({})
        // const delimiterBuffer = await wrap(delimiter)
        const data = await Promise.all(packet.map(wrap))
        return {
            id: packet
                .map((p) => p.id)
                .reduce((a, b) => (a << 8) + (b & 0xff), 0),
            name: getNames(packet),
            data: Buffer.concat(
                // data.map((d) => Buffer.concat([d.data, delimiterBuffer.data]))
                data.map((d) => d.data)
            ),
        } as ClientBoundPacket
    }
    return await wrap(packet)
}
