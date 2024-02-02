export enum ClientState {
    NONE = 0,
    HANDSHAKE = 1,
    LOGIN = 2,
}

export class Client {
    state: ClientState
    encrypted: boolean

    username: string | undefined
    uuid: string | undefined
    publicKey: Buffer | undefined

    constructor() {
        this.state = ClientState.NONE
        this.encrypted = false
    }
}
