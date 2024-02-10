import type { ClientBoundPacket } from './packets/create'
import type { ClientInfo } from './packets/server'
import type { Position, Rotation } from './position'
import type { SocketWithId } from './socket'

export enum ClientState {
    HANDSHAKING,
    STATUS,
    LOGIN,
    CONFIGURATION,
    PLAY,
}

export class Client {
    state: ClientState
    encrypted: boolean

    username: string | undefined
    uuid: string | undefined
    publicKey: Buffer | undefined

    info: ClientInfo | undefined
    position: Position | undefined
    rotation: Rotation | undefined

    constructor(public readonly socket: SocketWithId) {
        this.state = ClientState.HANDSHAKING
        this.encrypted = false
    }

    write(packet: ClientBoundPacket) {
        this.socket.write(packet.data)
    }
}
