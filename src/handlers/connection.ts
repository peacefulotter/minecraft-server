import { v4 as uuid } from 'uuid'
import { PacketNameToId } from '~/packet'
import type { HandlerArgs } from './main'
import { decrypt, hexDigest, publicKey, serverKeyRSA } from '~/auth'
import { ClientState } from '~/client'
import { String } from '~/types/basic'
import {
    EncryptionRequest,
    HandshakeResponse,
    LoginSuccess,
    Ping,
} from '~/packets/client-bound'
import { EncryptionResponse, Handshake } from '~/packets/server-bound'
import type { ClientBoundPacket } from '~/packets/create'

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

    handleHandshake = (args: HandlerArgs) => {
        const { client, buffer, packetId } = args
        console.log(
            '====================================',
            'this.handleHandshake'
        )
        const packet = Handshake(buffer, client.encrypted)
        console.log({ packetId, ...packet })
        client.state = packet.nextState
    }

    handleStatus = ({}: HandlerArgs) => {
        console.log('====================================', 'this.handleStatus')
        return HandshakeResponse()
    }

    handlePing = ({ buffer }: HandlerArgs) => {
        return Ping({ payload: Buffer.from(buffer) })
    }

    // Send encryption request
    handleLoginStart = ({ client, buffer }: HandlerArgs) => {
        console.log('====================================', 'this.handleLogin')
        // if unauthenticated
        console.log(buffer)
        console.log(String.write('"1234"'))
        console.log(String.write('genji__'))

        return LoginSuccess({
            uuid: '"1234"',
            username: 'genji__',
        })

        // const serverId = crypto.randomBytes(4)
        // const verifyToken = crypto.randomBytes(4)

        // const publicKeyStrArr = serverKeyRSA.exportKey('pkcs8-public-pem').split('\n')
        // let publicKeyStr = ''
        // for (let i = 1; i < publicKeyStrArr.length - 1; i++) {
        //     publicKeyStr += publicKeyStrArr[i]
        // }
        // const publicKey = Buffer.from(publicKeyStr, 'base64')

        // client.publicKey = publicKey
        // console.log('pubkey len', publicKey.length, formatting.writeVarInt(publicKey.length))
        // console.log('pubkey', publicKey)
        // console.log('token len', verifyToken.length, formatting.writeVarInt(verifyToken.length))
        // console.log('token', verifyToken)

        const serverId = 'minecraft-serverrr'
        const publicKey = Buffer.from([
            48, 129, 159, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1, 5,
            0, 3, 129, 141, 0, 48, 129, 137, 2, 129, 129, 0, 165, 152, 27, 55,
            161, 192, 11, 250, 184, 15, 7, 83, 126, 93, 173, 116, 1, 11, 122,
            230, 167, 22, 104, 168, 116, 50, 40, 197, 113, 40, 192, 199, 73,
            117, 170, 103, 91, 204, 184, 87, 37, 63, 188, 233, 128, 95, 229, 84,
            200, 60, 186, 150, 201, 238, 40, 183, 154, 96, 210, 214, 64, 58,
            244, 129, 211, 35, 117, 138, 2, 106, 35, 187, 24, 59, 250, 236, 28,
            49, 237, 59, 29, 8, 207, 177, 7, 201, 217, 101, 0, 146, 103, 237,
            102, 154, 38, 192, 195, 254, 189, 94, 229, 156, 55, 247, 186, 192,
            103, 140, 90, 60, 135, 88, 174, 85, 145, 180, 170, 172, 229, 137,
            83, 43, 58, 166, 251, 209, 134, 143, 2, 3, 1, 0, 1,
        ])
        const verifyToken = Buffer.from([188, 27, 63, 43])

        const packet = {
            serverId, // Server ID, appears to be empty
            publicKey,
            verifyToken,
        }
        return EncryptionRequest(packet)
    }

    // right after handleLogin
    sendCompress = () => {}

    // send success response right after handleLogin
    sendSuccess = () => {}

    handleEncryption = ({ client, buffer }: HandlerArgs) => {
        console.log(
            '====================================',
            'this.handleEncryption'
        )
        const response = EncryptionResponse(buffer, true)

        console.log(response)
        console.log(this.MOJANG_AUTH_URL)

        client.encrypted = true
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
        const { packetId, client } = args
        const { state } = client

        let packet: ClientBoundPacket | undefined = undefined

        // 1) Handshake
        if (
            packetId == PacketNameToId.status &&
            state === ClientState.HANDSHAKING
        ) {
            this.handleHandshake(args)
            if (client.state === ClientState.STATUS)
                packet = this.handleStatus(args)
        }
        // 2) Status Request, send status response
        else if (
            packetId == PacketNameToId.status &&
            state === ClientState.STATUS
        ) {
            packet = this.handleStatus(args)
        }
        // 3) Ping, send pong, ends handshake and closes connection
        else if (
            packetId == PacketNameToId.ping &&
            state === ClientState.STATUS
        ) {
            packet = this.handlePing(args)
        }
        // 4) Login Start, send encryption request
        else if (
            packetId == PacketNameToId.status &&
            state === ClientState.LOGIN
        ) {
            packet = this.handleLoginStart(args)
        }
        // 5) Encryption Response
        else if (
            packetId == PacketNameToId.ping &&
            state === ClientState.LOGIN
        ) {
            this.handleEncryption(args)
        } else {
            throw new Error('not supported')
        }
        // TODO: implement auth
        return packet
    }
}
