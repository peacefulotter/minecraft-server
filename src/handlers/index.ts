import { type Client } from '~/net/client'
import { hex, logServerBoundPacket } from '~/logger'
import type { PacketId } from '~/net/packets'
import type {
    ClientBoundPacket,
    ServerBoundPacket,
    ServerBoundPacketData,
    ServerBoundPacketDeserializer,
} from '~/net/packets/create'
import type { Server } from '~/net/server'

export type RawHandlerArgs = {
    server: Server
    client: Client
    packetId: number
    buffer: Buffer
    offset: number
}

export type ProcessHandlerArgs = Omit<RawHandlerArgs, 'buffer' | 'offset'>

type PacketArg<Deserializer extends ServerBoundPacketDeserializer> = {
    packet: Deserializer extends ServerBoundPacketDeserializer<
        any,
        any,
        infer Format
    >
        ? ServerBoundPacketData<Format>
        : never
}

export type Args<Deserializer extends ServerBoundPacketDeserializer> =
    ProcessHandlerArgs & PacketArg<Deserializer>

type HandleFunc<Deserializer extends ServerBoundPacketDeserializer> = (
    args: Args<Deserializer>
) => Promise<ClientBoundPacket | ClientBoundPacket[] | void>

export type PacketHandler<
    Deserializer extends ServerBoundPacketDeserializer = ServerBoundPacketDeserializer
> = {
    deserializer: Deserializer
    callback: HandleFunc<Deserializer>
}

export class Handler<T extends { [key: PacketId]: PacketHandler } = {}> {
    private constructor(readonly name: string, readonly handlers: T) {}

    static init = (name: string) => new Handler(name, {})

    register = <Deserializer extends ServerBoundPacketDeserializer>(
        deserializer: Deserializer,
        callback: HandleFunc<Deserializer>
    ) => {
        this.handlers[deserializer.id] = {
            deserializer,
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
            `Unknown packet for ${this.name} handler, id: ${hex(
                packetId
            )}, state: ${client.state}`
        )
    }

    handle = async (args: RawHandlerArgs) => {
        const { server, client, packetId, buffer, offset } = args
        const { deserializer, callback } = this.getHandler(packetId, client)
        const { packet, offset: packetLength } = await deserializer.deserialize(
            buffer,
            offset,
            client.encrypted
        )

        // as ServerBoundPacket

        logServerBoundPacket(packet, client)

        const response = await callback({
            server,
            client,
            packetId,
            packet: packet.data,
        })

        return { response, packetLength }
    }
}
