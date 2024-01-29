import { PacketNameToId } from '../packet'
import { HANDSHAKE_RESPONSE } from '../server'
import { readShort, readString, readVarInt } from '../formats'
import type { HandlerArgs } from './main'

export enum ConnectionState {
    NONE = 0,
    STATUS = 1,
    LOGIN = 2,
}

export class ConnectionHandler {
    handleHandshake = ({ buffer, state, packetId }: HandlerArgs) => {
        console.log(
            '====================================',
            'this.handleHandshake'
        )

        const protocol = readVarInt(buffer)
        buffer.shift()
        const hostname = readString(buffer, buffer.length - 3)
        const port = readShort(buffer)
        const nextState = readVarInt(buffer) as
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

    handle = (args: HandlerArgs) => {
        const { packetId, state } = args
        const { connection } = state
        console.log({ packetId, state })

        if (
            packetId == PacketNameToId.status &&
            connection === ConnectionState.NONE
        ) {
            return this.handleHandshake(args)
        } else if (
            packetId == PacketNameToId.status &&
            connection === ConnectionState.STATUS
        ) {
            return this.handleStatus(args)
        } else if (
            packetId == PacketNameToId.ping &&
            connection === ConnectionState.STATUS
        ) {
            // ends handshake
            return this.handlePing(args)
        } else if (
            packetId == PacketNameToId.status &&
            connection === ConnectionState.LOGIN
        ) {
            console.log('====================================', 'LOGIN ATTEMPT')
            console.log(args)
        }

        return Buffer.from([])
    }
}
