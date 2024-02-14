import * as NBT from 'nbtify'
import { logClientBoundPacket } from '../logger'
import { formatPacket } from './packets'
import type { ClientBoundPacket } from './packets/create'
import type { ClientInfo } from './packets/server'
import type { Position, Rotation } from '../position'
import type { SocketWithId } from '../socket'
import Long from 'long'
import {
    ConfigurationClientBoundKeepAlive,
    PlayClientBoundKeepAlive,
    PlayDisconnect,
} from './packets/client'

export enum ClientState {
    HANDSHAKING,
    STATUS,
    LOGIN,
    CONFIGURATION,
    PLAY,
    DISCONNECTED,
}

export const REFRESH_INTERVAL = 5000 // ms
export const KICK_TIMEOUT = 30000 // ms

export class Client {
    state: ClientState
    encrypted: boolean

    username: string | undefined
    uuid: string | undefined
    publicKey: Buffer | undefined

    info: ClientInfo | undefined
    position: Position
    rotation: Rotation

    refreshIn: number
    aliveTimeout: Record<string, NodeJS.Timeout> = {}

    constructor(public readonly socket: SocketWithId) {
        this.state = ClientState.HANDSHAKING
        this.encrypted = false
        this.position = { x: 0, y: 0, z: 0, onGround: true }
        this.rotation = { pitch: 0, yaw: 0 }
        this.refreshIn = REFRESH_INTERVAL
    }

    async write(packet: ClientBoundPacket | ClientBoundPacket[]) {
        const formatted = await formatPacket(packet)
        logClientBoundPacket(formatted, this)
        this.socket.write(formatted.data)
    }

    async kick() {
        this.state = ClientState.DISCONNECTED
        this.write(
            await PlayDisconnect({
                reason: NBT.parse(
                    JSON.stringify({
                        type: 'text',
                        text: 'GOT KICKED LOOSER',
                    })
                ),
            })
        )
        this.socket.end()
    }

    async checkAlive() {
        // No keep alive during handshaking, status and login
        if (
            this.state !== ClientState.CONFIGURATION &&
            this.state !== ClientState.PLAY
        )
            return

        const id = Long.fromNumber(Date.now())

        const KeepAlive = {
            [ClientState.CONFIGURATION]: ConfigurationClientBoundKeepAlive,
            [ClientState.PLAY]: PlayClientBoundKeepAlive,
        }[this.state]

        this.write(await KeepAlive({ id }))

        this.refreshIn = REFRESH_INTERVAL
        this.aliveTimeout[id.toString()] = setTimeout(this.kick, KICK_TIMEOUT)
    }

    keepAlive(id: Long) {
        clearTimeout(this.aliveTimeout[id.toString()])
        delete this.aliveTimeout[id.toString()]
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
