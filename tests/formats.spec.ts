import { generateV4 } from '@minecraft-js/uuid'
import { describe, test, expect } from 'bun:test'
import Long from 'long'
import {
    DataArray,
    DataByte,
    DataInt,
    DataLong,
    DataObject,
    DataOptional,
    DataShort,
    DataString,
    DataUUID,
    VarInt,
    VarIntPrefixedByteArray,
    VarLong,
} from '~/data-types/basic'
import {
    ClientBoundPacketCreator,
    ServerBoundPacketCreator,
    type PacketFormat,
    type PacketArguments,
} from '~/net/packets/create'

const packetTester = async <T extends PacketFormat>(
    format: T,
    packet: PacketArguments<T>
) => {
    const writePacket = ClientBoundPacketCreator(0x00, 'test', format)
    const readPacket = ServerBoundPacketCreator(0x00, 'test', format)
    const buffer = await writePacket(packet)
    const data = buffer.data.toJSON().data
    const res = await readPacket.deserialize(data, false)
    expect(res.data).toEqual(packet)
}

describe('formats', () => {
    test('uuid', async () => {
        await packetTester(
            {
                uuid: DataUUID,
            },
            {
                uuid: generateV4(),
            }
        )
    })

    test('optional', async () => {
        const format = {
            opt: DataOptional(DataString),
        }
        await packetTester(format, {
            opt: 'aaa',
        })
        await packetTester(format, {
            opt: undefined,
        })
    })

    test('object', async () => {
        const format = {
            obj: DataObject({
                a: DataString,
                b: DataInt,
            }),
        }
        await packetTester(format, {
            obj: {
                a: 'aaa',
                b: 42,
            },
        })
    })

    test('long', async () => {
        const data = Long.fromNumber(Date.now())

        await packetTester(
            {
                a: DataLong,
            },
            {
                a: data,
            }
        )

        await packetTester(
            {
                obj: DataObject({
                    a: DataLong,
                    b: VarLong,
                    c: DataLong,
                    d: VarLong,
                    e: DataLong,
                }),
            },
            {
                obj: {
                    a: data,
                    b: data.add(1),
                    c: data.add(2),
                    d: data.add(3),
                    e: data.add(4),
                },
            }
        )
    })

    test('is identity when writing -> reading', async () => {
        const format = {
            a: DataByte,
            b: VarIntPrefixedByteArray,
            c: DataShort,
            d: DataInt,
            e: DataString,
            f: VarInt,
            g: VarLong,
            h: DataUUID,
            i: DataOptional(DataString),
            j: DataObject({
                a: DataString,
                b: DataInt,
            }),
            k: DataArray(DataString),
            l: DataOptional(
                DataObject({
                    a: DataString,
                    b: DataArray(DataInt),
                })
            ),
            m: DataLong,
        }
        const writePacket = ClientBoundPacketCreator(0x00, 'test', format)
        const readPacket = ServerBoundPacketCreator(0x00, 'test', format)
        const packet: Parameters<typeof writePacket>[0] = {
            a: 42,
            b: Buffer.from([1, 2, 3]),
            c: 5,
            d: 6,
            e: 'hello world',
            f: 255,
            g: Long.fromNumber(Date.now()),
            h: generateV4(),
            i: 'aaa',
            j: {
                a: 'bbb',
                b: 42,
            },
            k: ['ccc', 'ddd', 'eee'],
            l: {
                a: 'fff',
                b: [1, 2, 3],
            },
            m: Long.fromNumber(Date.now()),
        } as const

        const buffer = await writePacket(packet)
        const data = buffer.data.toJSON().data

        const res = await readPacket.deserialize(data, false)
        expect(res.data).toEqual(packet)
    })
})
