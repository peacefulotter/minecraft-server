import chalk from 'chalk'
import type { Client } from '~/client'
import { byteToHex, log } from '~/logger'
import type { PacketId } from '~/packet'
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
) => Promise<ClientBoundPacket | void>

type PacketHandler<Packet extends ServerBoundPacket> = {
    packet: Packet
    handler: HandleFunc<Packet>
}

type HandlerMapper = Record<string, PacketHandler<any>>

// Utility function to create a packet handler, makes sure the packet and handler are of the same type
export const link = <T extends ServerBoundPacket>(
    packet: T,
    handler: HandleFunc<T>
): PacketHandler<T> => ({ packet, handler })

export abstract class Handler {
    handlers: HandlerMapper

    constructor(private readonly name: string, handlers: PacketHandler<any>[]) {
        this.handlers = handlers.reduce(
            (acc, { packet, handler }) => ({
                ...acc,
                [packet.id]: { packet, handler },
            }),
            {} as HandlerMapper
        )
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

    handle = async (args: RawHandlerArgs) => {
        const { packetId, buffer, client } = args
        if (this.isSupportedPacket(packetId)) {
            const { packet, handler } = this.handlers[packetId.toString()]
            const parsed = packet.parse(buffer, client.encrypted)
            log(
                'Handling packet',
                chalk.rgb(150, 255, 0)(packet.name),
                'for state',
                chalk.cyan(client.state),
                'with data',
                parsed
            )

            return handler({
                packetId,
                client,
                packet: parsed as unknown as ParsedServerBoundPacket<
                    typeof packet
                >,
            })
        }
        throw new Error(
            `Unknown packet id: ${byteToHex(packetId)} for state: ${
                args.client.state
            }`
        )
    }
}

class Test<A> {
    constructor(a: A) {
        console.log(a)
    }
}

const a = new Test(1)
