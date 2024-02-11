import chalk from 'chalk'
import type {
    ClientBoundPacket,
    ServerBoundPacket,
    ServerBoundPacketDeserializer,
} from './packets/create'
import { ClientState, type Client } from './client'
import type { Handler, PacketHandler } from './handlers'
import type { PacketId } from './packets'

export const log = (...message: any[]) => {
    const d = new Date()
    console.log(chalk.gray(`[${d.toISOString()}]`), ...message)
}

export const byteToHex = (byte: number) => {
    const key = '0123456789abcdef'
    let bytes = Buffer.from([byte])
    let newHex = ''
    let currentChar = 0
    for (let i = 0; i < bytes.length; i++) {
        // Go over each 8-bit byte
        currentChar = bytes[i] >> 4 // First 4-bits for first hex char
        newHex += key[currentChar] // Add first hex char to string
        currentChar = bytes[i] & 15 // Erase first 4-bits, get last 4-bits for second hex char
        newHex += key[currentChar] // Add second hex char to string
    }
    return '0x' + newHex
}

export const logHandler = <
    T extends { [key: PacketId]: PacketHandler<ServerBoundPacketDeserializer> }
>(
    handler: Handler<T>
) => {
    console.log(
        `-------{  ${chalk.greenBright(handler.name)}  }-------`,
        '\n' +
            Object.values(handler.handlers)
                .map(
                    ({ packet }) =>
                        `${chalk.yellowBright(byteToHex(packet.id))} - ${
                            packet.name
                        }`
                )
                .join('\n')
    )
}

const logPacket =
    (side: string) =>
    (packet: ClientBoundPacket | ServerBoundPacket, client: Client) => {
        log(
            chalk.redBright(side),
            'packet',
            chalk.rgb(150, 255, 0)(byteToHex(packet.id) + ':' + packet.name),
            'for state',
            chalk.cyan(ClientState[client.state]),
            'data:',
            packet.data
        )
    }

export const logClientBoundPacket = logPacket('Sending')
export const logServerBoundPacket = logPacket('Handling')
