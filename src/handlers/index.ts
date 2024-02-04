import type { Client } from '~/client'
import type { ClientBoundPacket } from '~/packets/create'

export type HandlerArgs = {
    client: Client
    packetId: number
    buffer: number[]
}

export interface Handler {
    handle: (args: HandlerArgs) => Promise<ClientBoundPacket | void>
}
