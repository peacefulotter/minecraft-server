import { PacketNameToId } from '../packet'
import { HANDSHAKE_RESPONSE } from '../server'
import * as formatting from '../formats'
import type { BufferResponse, HandlerArgs } from './main'
import { decrypt, hexDigest, pubKey } from '../auth'
import shortid from 'shortid'

export enum ConnectionState {
    NONE = 0,
    STATUS = 1,
    LOGIN = 2,
}

type AuthResponse = {
    id: string
    name: string
    properties: {
        name: string
        value: string
        signature: string
    }[]
}

export class ConnectionHandler {
    MOJANG_AUTH_URL = new URL(
        '',
        'https://sessionserver.mojang.com/session/minecraft/hasJoined'
    )

    handleHandshake = ({ buffer, state, packetId }: HandlerArgs) => {
        console.log(
            '====================================',
            'this.handleHandshake'
        )

        const protocol = formatting.readVarInt(buffer)
        buffer.shift()
        const hostname = formatting.readString(buffer, buffer.length - 3)
        const port = formatting.readShort(buffer)
        const nextState = formatting.readVarInt(buffer) as
            | ConnectionState.STATUS
            | ConnectionState.LOGIN
        state.connection = nextState

        console.log({ packetId, protocol, hostname, port, nextState })
        return HANDSHAKE_RESPONSE
    }

    handleStatus = ({}: HandlerArgs) => {
        console.log('====================================', 'this.handleStatus')
        return HANDSHAKE_RESPONSE
    }

    handlePing = ({ buffer }: HandlerArgs) => {
        return Buffer.from(buffer)
    }

    // Send encryption request
    handleLogin = ({}: HandlerArgs) => {
        console.log('====================================', 'this.handleLogin')
        const t = shortid.generate()
        const token = Buffer.from(t)
        console.log(
            'pubkey len',
            pubKey.length,
            formatting.writeVarInt(pubKey.length)
        )
        console.log('pubkey', pubKey)
        console.log(
            'token len',
            token.length,
            formatting.writeVarInt(token.length)
        )
        console.log('token', token)
        return {
            id: PacketNameToId.ping,
            packet: Buffer.concat([
                Buffer.from(''), // Server ID, appears to be empty
                formatting.writeVarInt(pubKey.length),
                pubKey,
                formatting.writeVarInt(token.length),
                token,
            ]),
        }
    }

    handleEncryption = ({ buffer }: HandlerArgs) => {
        console.log(
            '====================================',
            'this.handleEncryption'
        )
        const packet = decrypt(Buffer.from(buffer))
        console.log(packet)
        const decrypted = packet.toJSON().data

        const sharedSecretLen = formatting.readVarInt(decrypted)
        const sharedSecret = formatting.readBytes(decrypted, sharedSecretLen)

        console.log({ sharedSecretLen, sharedSecret })

        const verifyTokenLen = formatting.readVarInt(decrypted)
        const verifyToken = formatting.readBytes(decrypted, verifyTokenLen)

        console.log({ verifyTokenLen, verifyToken })

        console.log(this.MOJANG_AUTH_URL)

        return Buffer.from('')
    }

    handleAuth = async ({}: HandlerArgs) => {
        // TODO: implement
        const username = ''
        const ip = ''
        const secret = ''
        const hash = hexDigest(secret)

        const url = new URL(this.MOJANG_AUTH_URL)
        url.searchParams.set('username', username)
        url.searchParams.set('serverId', hash)
        url.searchParams.set('ip', ip)
        console.log(url)

        const res = await fetch(url)
        console.log(res)
        const json = (await res.json()) as AuthResponse
        console.log(json)
    }

    handle = async (args: HandlerArgs) => {
        const { packetId, state } = args
        const { connection } = state
        console.log({ connection })

        let responsePacketId = packetId
        let responseBuffer: Buffer | undefined

        // 1) Handshake
        if (
            packetId == PacketNameToId.status &&
            connection === ConnectionState.NONE
        ) {
            responseBuffer = this.handleHandshake(args)
        }
        // 2) Status Request, send status response
        else if (
            packetId == PacketNameToId.status &&
            connection === ConnectionState.STATUS
        ) {
            responseBuffer = this.handleStatus(args)
        }
        // 3) Ping, send pong, ends handshake and closes connection
        else if (
            packetId == PacketNameToId.ping &&
            connection === ConnectionState.STATUS
        ) {
            responseBuffer = this.handlePing(args)
        }
        // 4) Login Start, send encryption request
        else if (
            packetId == PacketNameToId.status &&
            connection === ConnectionState.LOGIN
        ) {
            const res = this.handleLogin(args)
            responsePacketId = res.id
            responseBuffer = res.packet
        }
        // 5) Encryption Response
        else if (
            packetId == PacketNameToId.ping &&
            connection === ConnectionState.LOGIN
        ) {
            this.handleEncryption(args)
        } else {
            throw new Error('not supported')
        }
        // TODO: implement auth
        return { responsePacketId, responseBuffer } as BufferResponse
    }
}
