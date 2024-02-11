import chalk from 'chalk'
import { ClientState, type Client } from '~/client'
import { byteToHex, log } from '~/logger'
import type { PacketId } from '~/packets'
import type {
    ClientBoundPacket,
    ParsedServerBoundPacket,
    ServerBoundPacket,
} from '~/packets/create'

export type RawHandlerArgs = {
    client: Client
    packetId: number
    buffer: number[]
}

export type Args<T extends ServerBoundPacket> = Omit<
    RawHandlerArgs,
    'buffer'
> & {
    packet: ParsedServerBoundPacket<T>
}

export type HandleFunc<T extends ServerBoundPacket> = (
    args: Args<T>
) => Promise<ClientBoundPacket | ClientBoundPacket[] | void>

type PacketHandler = {
    packet: ServerBoundPacket
    handler: HandleFunc<ServerBoundPacket>
}

export class HandlerBuilder<T extends { [key: PacketId]: PacketHandler } = {}> {
    constructor(private readonly handlers: T) {}

    addPacket = <T extends ServerBoundPacket>(
        packet: T,
        handler: HandleFunc<T>
    ) => {
        return new HandlerBuilder({
            ...this.handlers,
            [packet.id]: { packet, handler },
        })
    }

    build = (name: string) => new Handler(name, this.handlers)
}

export class Handler<T extends { [key: PacketId]: PacketHandler } = {}> {
    constructor(private readonly name: string, private readonly handlers: T) {
        console.log(
            `-------{  ${chalk.greenBright(name)}  }-------`,
            '\n' +
                Object.values(this.handlers)
                    .map(
                        ({ packet }) =>
                            `${chalk.yellowBright(byteToHex(packet.id))} - ${
                                packet.name
                            }`
                    )
                    .join('\n')
        )
    }

    isSupportedPacket = (packetId: number): packetId is number => {
        return packetId in this.handlers
    }

    getHandler = (packetId: number, client: Client) => {
        if (this.isSupportedPacket(packetId)) {
            return this.handlers[packetId]
        }
        throw new Error(
            `Unknown packet for ${this.name} handler, id: ${byteToHex(
                packetId
            )}, state: ${ClientState[client.state]}`
        )
    }

    handle = async (args: RawHandlerArgs) => {
        const { packetId, buffer, client } = args
        const { packet, handler } = this.getHandler(packetId, client)
        const parsed = packet.parse(buffer, client.encrypted)
        log(
            chalk.redBright('Handling'),
            'packet',
            chalk.rgb(150, 255, 0)(byteToHex(packet.id) + ':' + packet.name),
            'for state',
            chalk.cyan(ClientState[client.state]),
            'with data',
            parsed
        )

        return handler({
            packetId,
            client,
            packet: parsed,
        })
    }
}
