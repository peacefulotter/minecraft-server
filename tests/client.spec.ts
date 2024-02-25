import { describe, test, expect } from 'bun:test'
import { DataString } from '~/data/types'
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

const DummyPacket = ClientBoundPacketCreator(0xf, 'dummy', {
    test: DataString,
})

const packet0 = [
    await DummyPacket({ test: 'A' }),
    await DummyPacket({ test: 'B' }),
    await DummyPacket({ test: 'C' }),
]

const packet1 = [
    await DummyPacket({ test: 'D' }),
    await DummyPacket({ test: 'E' }),
    await DummyPacket({ test: 'F' }),
]

describe('client', () => {
    test('server should format packets for client', async () => {
        const client = await getClient()

        await client.write(packet0)

        const packets = [packet0, packet1]
        await client.write(packets)
    })
})
