import { ClientState, type Client } from '~/client'
import { byteToHex, logServerBoundPacket } from '~/logger'
import type { PacketId } from '~/packets'
import type {
    ClientBoundPacket,
    ServerBoundPacket,
    ServerBoundPacketData,
    ServerBoundPacketDeserializer,
} from '~/packets/create'

export type RawHandlerArgs = {
    client: Client
    packetId: number
    buffer: number[]
}

type Args<Packet extends ServerBoundPacketDeserializer> = Omit<
    RawHandlerArgs,
    'buffer'
> & {
    packet: ServerBoundPacketData<Packet>
}

type HandleFunc<Packet extends ServerBoundPacketDeserializer> = (
    args: Args<Packet>
) => Promise<ClientBoundPacket | ClientBoundPacket[] | void>

export type PacketHandler<
    Packet extends ServerBoundPacketDeserializer = ServerBoundPacketDeserializer
> = {
    packet: Packet
    callback: HandleFunc<Packet>
}

export class Handler<T extends { [key: PacketId]: PacketHandler } = {}> {
    private constructor(readonly name: string, readonly handlers: T) {}

    static init = (name: string) => new Handler(name, {})

    register = <Packet extends ServerBoundPacketDeserializer>(
        packet: Packet,
        callback: HandleFunc<Packet>
    ) => {
        this.handlers[packet.id] = {
            packet,
            callback: callback as HandleFunc<ServerBoundPacketDeserializer>,
        }
        return this
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
        const { packet, callback } = this.getHandler(packetId, client)
        const parsed = (await packet.deserialize(
            buffer,
            client.encrypted
        )) as ServerBoundPacket

        logServerBoundPacket(parsed, client)

        return callback({
            packetId,
            client,
            packet: parsed.data,
        })
    }
}
