import leb128 from 'leb128'
import shortid from 'shortid'
import { PacketIdToName, PacketNameToId, type PacketId } from './packet'
import type { SocketId, SocketWithId } from './socket'
import { MainHandler } from './handlers/main'
import { Client, ClientState } from './client'
import { Builder } from './formats/read'

export class Server {
    private clients: Record<SocketId, Client> = {}
    private handler = new MainHandler()

    getPacketFormat = (data: Buffer) => {
        let buffer = data.toJSON().data
        const length = formatting.readVarInt(buffer)

        // Handle legacy server list ping
        if (length == PacketNameToId.legacy_server_list_ping) {
            return {
                packetId: PacketNameToId.legacy_server_list_ping as PacketId,
                buffer,
            }
        } else buffer = buffer.slice(0, length)
        const packetId = readVarInt(buffer) as PacketId
        return { packetId, buffer }
    }

    formatPing = (packet: Buffer) => {
        console.log('====================================', 'this.handlePing')
        const packetLengthBuffer = leb128.signed.encode(packet.length + 1)
        console.log(packet, packetLengthBuffer)
        return Buffer.concat([packetLengthBuffer, Buffer.from([PacketNameToId.ping]), packet])
    }

    formatResponse = (packetId: PacketId, packet: Buffer) => {
        const respLengthBuffer = leb128.signed.encode(packet.length)
        const packetLengthBuffer = leb128.signed.encode(packet.length + respLengthBuffer.length + 1)

        console.log('--- response ---')
        console.log(
            'packetLengthBuffer',
            packet.length,
            '->',
            packetLengthBuffer,
            formatting.writeVarInt(packet.length)
        )
        console.log('packID', packetId, '->', Buffer.from([packetId]))
        console.log(
            'respLengthBuffer',
            packet.length + respLengthBuffer.length + 1,
            '->',
            respLengthBuffer,
            formatting.writeVarInt(packet.length + respLengthBuffer.length + 1)
        )

        return Buffer.concat([
            packetLengthBuffer,
            Buffer.from([packetId]), // FIXME: works for now, but what about packetIds > 255
            respLengthBuffer,
            packet,
        ])
    }

    isPingPacket = (client: Client, packetId: PacketId) =>
        packetId === PacketNameToId.ping &&
        (client.state === ClientState.NONE || client.state === ClientState.HANDSHAKE)

    formatPacket = (client: Client, packetId: PacketId, packet: Buffer) => {
        return this.isPingPacket(client, packetId)
            ? this.formatPing(packet)
            : this.formatResponse(packetId, packet)
    }

    // TODO: future
    // send = (client: Client, packetId: PacketId, packet: Buffer) => {
    //     const formattedPacket = this.formatPacket(client, packetId, packet)
    //     socket.write(formattedPacket)
    // }

    data = async (socket: SocketWithId, data: Buffer) => {
        const client = this.clients[socket.id]

        const { packetId, buffer } = this.getPacketFormat(data)
        const name = PacketIdToName.get(packetId)
        console.log('Received packet', {
            socketId: socket.id,
            packetId,
            name,
        })

        if (!name) {
            console.log('Unknown packet', {
                socketId: socket.id,
                packetId,
                name,
            })
            return
        }

        const response = await this.handler[name]({
            socket,
            client,
            packetId,
            buffer,
        })
        if (!response || !response.responseBuffer) return

        const { responsePacketId, responseBuffer } = response
        const responseId = responsePacketId ?? packetId

        const packet = this.formatPacket(client, responseId, responseBuffer)

        console.log('Responding packet', {
            socketId: socket.id,
            packetId,
            responsePacketId,
            response,
            packet,
        })
        socket.write(packet)
    }

    open = (socket: SocketWithId) => {
        const id = shortid.generate()
        socket.id = id
        this.clients[id] = new Client()
        console.log('Socket connected', socket.id)
    }
    close = (socket: SocketWithId) => {
        console.log('Socket disconnected', socket.id)
        delete this.clients[socket.id]
    }

    error = (socket: SocketWithId, error: object) => {
        console.log(JSON.stringify(error, null, 2))
    }
}
