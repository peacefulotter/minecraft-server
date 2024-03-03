import { type Client } from '~/net/client'
import { hex, logServerBoundPacket } from '~/logger'
import type { PacketId } from '~/net/packets'
import type {
    ClientBoundPacket,
    ServerBoundPacketCreator,
    ServerBoundPacketData,
    ServerBoundPacketDataFromCreator,
} from '~/net/packets/create'
import type { Server } from '~/net/server'
import type { PacketBuffer } from '~/net/PacketBuffer'

export type RawHandlerArgs = {
    server: Server
    client: Client
    packetId: number
    buffer: PacketBuffer
}

export type ProcessHandlerArgs = Omit<RawHandlerArgs, 'buffer' | 'offset'>

export type Args<Creator extends ServerBoundPacketCreator> =
    ProcessHandlerArgs & {
        packet: ServerBoundPacketDataFromCreator<Creator>
    }

type HandleCallback<Creator extends ServerBoundPacketCreator> = (
    args: Args<Creator>
) => Promise<ClientBoundPacket | ClientBoundPacket[] | void>

export type PacketHandler<
    Creator extends ServerBoundPacketCreator = ServerBoundPacketCreator
> = {
    creator: Creator
    callback: HandleCallback<Creator>
}

export class Handler<T extends { [key: PacketId]: PacketHandler } = {}> {
    private constructor(readonly name: string, readonly handlers: T) {}

    static init = (name: string) => new Handler(name, {})

    register = <Creator extends ServerBoundPacketCreator>(
        creator: Creator,
        callback: HandleCallback<Creator>
    ) => {
        this.handlers[creator.id] = {
            creator,
            callback,
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
        const { server, client, packetId, buffer } = args
        const { creator, callback } = this.getHandler(packetId, client)
        const packet = await creator.deserialize(buffer, client.encrypted)

        logServerBoundPacket(packet, client)

        return await callback({
            server,
            client,
            packetId,
            packet: packet.data,
        })
    }
}
