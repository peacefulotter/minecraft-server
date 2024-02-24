import * as NBT from 'nbtify'

import { logClientBoundPacket } from '../logger'
import { formatPacket } from './packets'
import type { ClientBoundPacket } from './packets/create'
import type { ClientInfo } from './packets/server'
import type { SocketWithId } from '../socket'
import Long from 'long'
import {
    ConfigurationClientBoundKeepAlive,
    PlayClientBoundKeepAlive,
    PlayDisconnect,
} from './packets/client'
import { Player } from '~/entity/player'

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

export class Client extends Player {
    // https://raw.githubusercontent.com/Pokechu22/Burger/gh-pages/1.20.4.json
    static ENTITY_TYPE = 124 as const // TODO: retrieve this properly

    state: ClientState = ClientState.HANDSHAKING
    encrypted: boolean = false

    refreshIn: number = REFRESH_INTERVAL

    publicKey: Buffer | undefined

    info: ClientInfo | undefined

    ping: number = 0
    aliveTimeout: Record<
        string,
        {
            date: number
            timeout: NodeJS.Timeout
        }
    > = {}

    constructor(public readonly socket: SocketWithId) {
        super(Client.ENTITY_TYPE)
    }

    async write(packet: ClientBoundPacket | ClientBoundPacket[]) {
        const formatted = await formatPacket(packet)
        logClientBoundPacket(formatted, this)
        this.socket.write(formatted.data)
    }

    // TODO: ping from time to time as well

    async kick() {
        this.state = ClientState.DISCONNECTED
        this.write(
            await PlayDisconnect({
                // TODO: fix Chat type
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

        const now = Date.now()
        const id = Long.fromNumber(now)

        const KeepAlive = {
            [ClientState.CONFIGURATION]: ConfigurationClientBoundKeepAlive,
            [ClientState.PLAY]: PlayClientBoundKeepAlive,
        }[this.state]

        this.write(await KeepAlive({ id }))

        this.refreshIn = REFRESH_INTERVAL
        this.aliveTimeout[id.toString()] = {
            date: now,
            timeout: setTimeout(this.kick.bind(this), KICK_TIMEOUT),
        }
    }

    keepAlive(id: Long) {
        const { timeout, date } = this.aliveTimeout[id.toString()]
        clearTimeout(timeout)
        delete this.aliveTimeout[id.toString()]
        this.ping = Date.now() - date
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
    get onGround() {
        return this.position.onGround
    }
    get yaw() {
        return this.rotation.yaw
    }
    get pitch() {
        return this.rotation.pitch
    }
    get velocityX() {
        return this.velocity.x
    }
    get velocityY() {
        return this.velocity.y
    }
    get velocityZ() {
        return this.velocity.z
    }
    get uuid() {
        return this.entityUUID
    }

    public toString(): string {
        return `Client 
            username: ${this.username}
            state: ${ClientState[this.state]}
            ping: ${this.ping}ms
            ${super.toString()}            
        `
    }

    public [Symbol.toPrimitive](): string {
        return this.toString()
    }

    public [Symbol.for('nodejs.util.inspect.custom')](): string {
        return this.toString()
    }
}
