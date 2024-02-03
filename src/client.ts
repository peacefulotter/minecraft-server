import type { SocketWithId } from './socket'

export enum ClientState {
    HANDSHAKING = 0,
    STATUS = 1,
    LOGIN = 2,
}

export class Client {
    state: ClientState
    encrypted: boolean

    username: string | undefined
    uuid: string | undefined
    publicKey: Buffer | undefined

    constructor(public readonly socket: SocketWithId) {
        this.state = ClientState.HANDSHAKING
        this.encrypted = false
    }

    write(packet: Buffer) {
        this.socket.write(packet)
    }
}
