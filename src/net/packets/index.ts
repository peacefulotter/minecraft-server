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

const formatPacketGroup = async (packets: ClientBoundPacket[]) => {
    const data = await Promise.all(packets.map(wrap))
    return {
        id: packets.map((p) => p.id).reduce((a, b) => (a << 8) + (b & 0xff), 0),
        name: getNames(packets),
        data: Buffer.concat(
            // data.map((d) => Buffer.concat([d.data, delimiterBuffer.data]))
            data.map((d) => d.data)
        ),
    } as ClientBoundPacket
}

const bundlePackets = async (packets: ClientBoundPacket[], join: boolean) => {
    return {
        id: packets.map((p) => p.id).reduce((a, b) => (a << 8) + (b & 0xff), 0),
        name: packets
            .map((p) => p.name)
            .reduce(
                (acc, p) =>
                    join
                        ? acc.length === 0
                            ? p
                            : `${acc} | ${p}`
                        : `${acc} [${p}] `,
                ''
            ),
        data: Buffer.concat(packets.map((p) => p.data)),
    } as ClientBoundPacket
}

const is1DPackets = (
    packet: ClientBoundPacket | ClientBoundPacket[] | ClientBoundPacket[][]
): packet is ClientBoundPacket[] => {
    return Array.isArray(packet) && !Array.isArray(packet[0])
}

const is2DPackets = (
    packet: ClientBoundPacket | ClientBoundPacket[] | ClientBoundPacket[][]
): packet is ClientBoundPacket[][] => {
    return Array.isArray(packet) && Array.isArray(packet[0])
}

export const formatPacket = async (
    packet: ClientBoundPacket | ClientBoundPacket[] | ClientBoundPacket[][]
) => {
    if (is1DPackets(packet)) {
        return formatPacketGroup(packet)
    }

    if (is2DPackets(packet)) {
        const delimiter = await BundleDelimiter({})
        const bundles = packet.map(async (packets) => {
            const group = await formatPacketGroup(packets)
            return bundlePackets(
                [await wrap(delimiter), group, await wrap(delimiter)],
                true
            )
        })
        return bundlePackets(await Promise.all(bundles), false)
    }

    return await wrap(packet)
}
