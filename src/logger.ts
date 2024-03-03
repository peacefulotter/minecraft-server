import chalk from 'chalk'
import type {
    ClientBoundPacket,
    ServerBoundPacket,
    ServerBoundPacketCreator,
} from './net/packets/create'
import { type Client } from './net/client'
import type { Handler, PacketHandler } from './handlers'
import type { PacketId } from './net/packets'
import type { Command } from './commands/handler'

export const log = (...message: any[]) => {
    const d = new Date()
    console.log(chalk.gray(`[${d.toISOString()}]`), ...message)
}

export const hex = (byte: number) => {
    const hex = byte.toString(16)
    return '0x' + (hex.length % 2 === 1 ? '0' : '') + hex
}

export const logCmdHandler = (commands: Map<string, Command>) => {
    console.log(
        `-------{  ${chalk.red('Commands')}  }-------`,
        `\n${[...commands.values()]
            .map((cmd) => `${chalk.redBright(cmd.name)}: ${cmd.description}`)
            .join('\n')}`
    )
}

export const logHandler = <
    T extends { [key: PacketId]: PacketHandler<ServerBoundPacketCreator> }
>(
    handler: Handler<T>
) => {
    console.log(
        `-------{  ${chalk.greenBright(handler.name)}  }-------`,
        '\n' +
            Object.values(handler.handlers)
                .map(
                    ({ creator }) =>
                        `${chalk.yellowBright(hex(creator.id))} - ${
                            creator.name
                        }`
                )
                .join('\n')
    )
}

const logPacket =
    (side: string) =>
    (packet: ClientBoundPacket | ServerBoundPacket, client: Client) => {
        if (!packet.loggable) return
        log(
            chalk.gray(client.entityId),
            chalk.redBright(side),
            chalk.cyan(client.state.toUpperCase()),
            chalk.rgb(150, 255, 0)(hex(packet.id) + ' : ' + packet.name),
            packet.data
        )
    }

export const logClientBoundPacket = logPacket('S -> C')
export const logServerBoundPacket = logPacket('C -> S')
