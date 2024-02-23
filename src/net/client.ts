import * as NBT from 'nbtify'

import { logClientBoundPacket } from '../logger'
import { formatPacket } from './packets'
import type { ClientBoundPacket } from './packets/create'
import type { ClientInfo } from './packets/server'
import type { Position, Rotation, Vec3 } from '../position'
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

    aliveTimeout: Record<string, NodeJS.Timeout> = {}

    constructor(public readonly socket: SocketWithId) {
        super(Client.ENTITY_TYPE)
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

        const id = Long.fromNumber(Date.now())

        const KeepAlive = {
            [ClientState.CONFIGURATION]: ConfigurationClientBoundKeepAlive,
            [ClientState.PLAY]: PlayClientBoundKeepAlive,
        }[this.state]

        this.write(await KeepAlive({ id }))

        this.refreshIn = REFRESH_INTERVAL
        this.aliveTimeout[id.toString()] = setTimeout(
            this.kick.bind(this),
            KICK_TIMEOUT
        )
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
}
