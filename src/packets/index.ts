import { DataByteArray, DataInt, VarInt } from '~/data-types/basic'
import type { ClientBoundPacket } from './create'
import { ClientState, type Client } from '~/client'
import { WrapResponse } from './client'
import { byteToHex, log } from '~/logger'
import chalk from 'chalk'

export type PacketId = number

export const formatPacket = async (
    packet: ClientBoundPacket,
    client: Client
) => {
    const packetLen = packet.data.length + VarInt.write(packet.id).length
    const res = await WrapResponse.create({
        packetLen,
        ...packet,
    })

    log(
        chalk.redBright('Responding'),
        'packet',
        chalk.rgb(150, 255, 0)(byteToHex(packet.id) + ':' + packet.name),
        'for state',
        chalk.cyan(ClientState[client.state]),
        'packet length:',
        packetLen,
        'data:',
        res.data
    )

    return res
}
