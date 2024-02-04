import { v4 as uuid } from 'uuid'
import { hexDigest } from '~/auth'
import { ClientState } from '~/client'
import { log } from '~/logger'
import chalk from 'chalk'
import { Handler, type Args, link } from '.'
import {
    EncryptionResponse,
    LoginAcknowledged,
    LoginPluginResponse,
    LoginStart,
} from '~/packets/server'
import { LoginSuccess } from '~/packets/client'

type AuthResponse = {
    id: string
    name: string
    properties: {
        name: string
        value: string
        signature: string
    }[]
}

export class LoginHandler extends Handler {
    static MOJANG_AUTH_URL = new URL(
        '',
        'https://sessionserver.mojang.com/session/minecraft/hasJoined'
    )

    constructor() {
        super('Login', [
            link(LoginStart, LoginHandler.onLoginStart),
            link(EncryptionResponse, LoginHandler.onEncryptionResponse),
            link(LoginPluginResponse, LoginHandler.onLoginPluginResponse),
            link(LoginAcknowledged, LoginHandler.onLoginAcknowledged),
        ])
    }

    static onLoginStart = async ({
        client,
        packet,
    }: Args<typeof LoginStart>) => {
        client.username = packet.username
        client.uuid = uuid()

        log(
            'User',
            chalk.cyan(client.username),
            'logged in',
            chalk.green('successfully')
        )

        return LoginSuccess({
            uuid: client.uuid,
            username: client.username,
            numberOfProperties: 0,
        })

        // const serverId = crypto.randomBytes(4).toString('utf-8')
        // const verifyToken = crypto.randomBytes(4)

        // const publicKeyStrArr = serverKeyRSA
        //     .exportKey('pkcs8-public-pem')
        //     .split('\n')
        // let publicKeyStr = ''
        // for (let i = 1; i < publicKeyStrArr.length - 1; i++) {
        //     publicKeyStr += publicKeyStrArr[i]
        // }
        // const publicKey = Buffer.from(publicKeyStr, 'base64')
        // client.publicKey = publicKey

        // const serverId = 'minecraft-serverrr'
        // const publicKey = Buffer.from([
        //     48, 129, 159, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1, 5,
        //     0, 3, 129, 141, 0, 48, 129, 137, 2, 129, 129, 0, 165, 152, 27, 55,
        //     161, 192, 11, 250, 184, 15, 7, 83, 126, 93, 173, 116, 1, 11, 122,
        //     230, 167, 22, 104, 168, 116, 50, 40, 197, 113, 40, 192, 199, 73,
        //     117, 170, 103, 91, 204, 184, 87, 37, 63, 188, 233, 128, 95, 229, 84,
        //     200, 60, 186, 150, 201, 238, 40, 183, 154, 96, 210, 214, 64, 58,
        //     244, 129, 211, 35, 117, 138, 2, 106, 35, 187, 24, 59, 250, 236, 28,
        //     49, 237, 59, 29, 8, 207, 177, 7, 201, 217, 101, 0, 146, 103, 237,
        //     102, 154, 38, 192, 195, 254, 189, 94, 229, 156, 55, 247, 186, 192,
        //     103, 140, 90, 60, 135, 88, 174, 85, 145, 180, 170, 172, 229, 137,
        //     83, 43, 58, 166, 251, 209, 134, 143, 2, 3, 1, 0, 1,
        // ])
        // const verifyToken = Buffer.from([188, 27, 63, 43])

        // const p = {
        //     serverId, // Server ID, appears to be empty
        //     publicKey,
        //     verifyToken,
        // }
        // console.log(p)
        // return EncryptionRequest(p)
    }

    static onEncryptionResponse = async ({
        client,
        packet,
    }: Args<typeof EncryptionResponse>) => {
        console.log(
            '====================================',
            'this.handleEncryption'
        )
        console.log(packet)
        client.encrypted = true
    }

    // TODO: implement
    static onLoginPluginResponse = async ({
        client,
        packet,
    }: Args<typeof LoginPluginResponse>) => {
        console.log(
            '====================================',
            'this.handleLoginPluginResponse',
            '\n-------- TODO --------'
        )
        console.log(packet)
    }

    // TODO: implement
    static onAuth = async ({}: Args<any>) => {
        const username = ''
        const ip = ''
        const secret = ''
        const hash = hexDigest(secret)

        const url = new URL(LoginHandler.MOJANG_AUTH_URL)
        url.searchParams.set('username', username)
        url.searchParams.set('serverId', hash)
        url.searchParams.set('ip', ip)
        console.log(url)

        const res = await fetch(url)
        console.log(res)
        const json = (await res.json()) as AuthResponse
        console.log(json)
    }

    static onLoginAcknowledged = async ({
        client,
    }: Args<typeof LoginAcknowledged>) => {
        client.state = ClientState.CONFIGURATION
    }
}
