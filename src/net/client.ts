import * as NBT from 'nbtify'

import { logClientBoundPacket } from '../logger'
import type { ClientBoundPacket } from './packets/create'
import type { SocketWithId } from '../socket'
import {
    ConfigurationClientBoundKeepAlive,
    PlayClientBoundKeepAlive,
    PlayDisconnect,
} from './packets/client'
import { Player } from '~/entity/entities'
import { formatPacket } from './packets/format'
import type { ClientInfo } from './packets/server/configuration'
import Long from 'long'

export enum ClientState {
    HANDSHAKING = 'handshake',
    STATUS = 'status',
    LOGIN = 'login',
    CONFIGURATION = 'configuration',
    PLAY = 'play',
    DISCONNECTED = 'disconnected',
}

export const REFRESH_INTERVAL = 5000 // ms
export const KICK_TIMEOUT = 30000 // ms

export class Client extends Player {
    state: ClientState = ClientState.HANDSHAKING
    encrypted: boolean = false

    refreshIn: number = REFRESH_INTERVAL

    publicKey: Buffer | undefined

    clientInfo: ClientInfo | undefined

    ping: number = 0
    aliveTimeout: Record<
        string,
        {
            date: number
            timeout: NodeJS.Timeout
        }
    > = {}

    constructor(public readonly socket: SocketWithId) {
        super()
    }

    async write(
        packet: ClientBoundPacket | ClientBoundPacket[] | ClientBoundPacket[][],
        log: boolean = true
    ) {
        const formatted = await formatPacket(packet)
        if (log) logClientBoundPacket(formatted, this)
        this.socket.write(formatted.data.buffer)
    }

    async kick() {
        this.state = ClientState.DISCONNECTED
        this.write(
            await PlayDisconnect.serialize({
                // TODO: fix Chat type
                reason: NBT.parse(
                    JSON.stringify({
                        color: 'light_purple',
                        text: 'You have been kicked from the server',
                        bold: true,
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

        this.write(await KeepAlive.serialize({ id }), false)

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

    public [Bun.inspect.custom]() {
        return {
            state: this.state.toUpperCase(),
            ping: this.ping,
            ...super[Bun.inspect.custom](),
        }
    }
}
