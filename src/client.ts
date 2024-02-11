import { formatPacket } from './packets'
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
    DISCONNECTED,
}

export class Client {
    state: ClientState
    encrypted: boolean

    username: string | undefined
    uuid: string | undefined
    publicKey: Buffer | undefined

    info: ClientInfo | undefined
    position: Position
    rotation: Rotation

    constructor(public readonly socket: SocketWithId) {
        this.state = ClientState.HANDSHAKING
        this.encrypted = false
        this.position = { x: 0, y: 0, z: 0, onGround: true }
        this.rotation = { pitch: 0, yaw: 0 }
    }

    async write(packet: ClientBoundPacket | ClientBoundPacket[]) {
        const formatted = await formatPacket(packet, this)
        this.socket.write(formatted.data)
    }

    get x() {
        return this.position.x
    }
    get y() {
        return this.position.y
    }
    get z() {
        return this.position.z
    }
    get yaw() {
        return this.rotation.yaw
    }
    get pitch() {
        return this.rotation.pitch
    }
}
