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

    constructor() {
        this.state = ClientState.HANDSHAKING
        this.encrypted = false
    }
}
