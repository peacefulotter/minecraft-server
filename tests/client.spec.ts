import { describe, test, expect } from 'bun:test'
import { DataString } from '~/net/types'
import { Client } from '~/net/client'
import { ClientBoundPacketCreator } from '~/net/packets/create'
import { Server } from '~/net/server'
import type { SocketWithId } from '~/socket'

const getClient = async () => {
    const server = new Server()
    Bun.listen({
        hostname: 'localhost',
        port: 25565,
        socket: server,
    })
    const socket = (await Bun.connect({
        hostname: 'localhost',
        port: 25565,
        socket: {
            data: () => {},
        },
    })) as SocketWithId
    socket.id = 0
    return new Client(socket)
}

const DummyPacket = new ClientBoundPacketCreator(0x0, 'dummy', {
    test: new DataString(),
})

const packet0 = [
    await DummyPacket.serialize({ test: 'A' }),
    await DummyPacket.serialize({ test: 'B' }),
    await DummyPacket.serialize({ test: 'C' }),
]

const packet1 = [
    await DummyPacket.serialize({ test: 'D' }),
    await DummyPacket.serialize({ test: 'E' }),
    await DummyPacket.serialize({ test: 'F' }),
]

describe('client', () => {
    test('server should format packets for client', async () => {
        const client = await getClient()

        await client.write(packet0)

        const packets = [packet0, packet1]
        await client.write(packets)
    })
})
