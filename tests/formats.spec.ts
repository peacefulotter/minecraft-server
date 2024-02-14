import { describe, test, expect } from 'bun:test'
import Long from 'long'
import {
    DataByte,
    DataInt,
    DataShort,
    DataString,
    VarInt,
    VarIntPrefixedByteArray,
    VarLong,
} from '~/data-types/basic'
import {
    ClientBoundPacketCreator,
    ServerBoundPacketCreator,
} from '~/net/packets/create'

describe('formats', () => {
    test('is identity when writing -> reading', async () => {
        const format = {
            a: DataByte,
            b: VarIntPrefixedByteArray,
            c: DataShort,
            d: DataInt,
            e: DataString,
            f: VarInt,
            g: VarLong,
        }
        const writePacket = ClientBoundPacketCreator(0x00, 'test', format)
        const readPacket = ServerBoundPacketCreator(0x00, 'test', format)
        const packet = {
            a: 42,
            b: Buffer.from([1, 2, 3]),
            c: 5,
            d: 6,
            e: 'hello world',
            f: 255,
            g: Long.fromNumber(Date.now()),
        } as const
        const buffer = await writePacket(packet)
        console.log(buffer)
        const data = buffer.data.toJSON().data

        const res = await readPacket.deserialize(data, false)
        expect(res.data).toEqual(packet)
    })
})
