import leb128 from 'leb128'
import { type PacketEmitterArgs, PacketNameToId } from './packet'
import { HANDSHAKE_RESPONSE } from './server'
import { readShort, readString, readVarInt, writeVarInt } from './var'

enum HandshakeState {
    NONE = 0,
    STATUS = 1,
    LOGIN = 2,
}

export class Handshake {
    state: HandshakeState

    constructor() {
        this.state = HandshakeState.NONE
    }

    handleHandshake = ({ buffer, id }: PacketEmitterArgs) => {
        const protocol = readVarInt(buffer)
        buffer.shift()
        const hostname = readString(buffer, buffer.length - 3)
        const port = readShort(buffer)
        const nextState = readVarInt(buffer)
        console.log({ id, protocol, hostname, port, nextState })
        return HANDSHAKE_RESPONSE
    }

    handleStatus = ({}: PacketEmitterArgs) => {
        return HANDSHAKE_RESPONSE
    }

    handlePing = ({ socket, buffer }: PacketEmitterArgs) => {
        const data = Buffer.from(buffer)
        const packetLengthBuffer = leb128.signed.encode(data.length + 1)

        const res = Buffer.concat([
            packetLengthBuffer,
            Buffer.from('01', 'hex'),
            data,
        ])
        // TODO: find better way then writing here
        socket.write(res)
    }

    handle = (args: PacketEmitterArgs) => {
        const { id } = args
        console.log({ id, state: this.state })

        if (id == PacketNameToId.status && this.state === HandshakeState.NONE) {
            this.state = HandshakeState.STATUS
            return this.handleHandshake(args)
        } else if (
            id == PacketNameToId.status &&
            this.state === HandshakeState.STATUS
        ) {
            return this.handleStatus(args)
        } else if (
            id == PacketNameToId.ping &&
            this.state === HandshakeState.STATUS
        ) {
            this.state = HandshakeState.LOGIN
            return this.handlePing(args)
        }

        return Buffer.from([])
    }
}
