import path from 'path'
import * as NBT from 'nbtify'
import { generateV4 } from '@minecraft-js/uuid'
import BitSet from 'bitset'
import { describe, test, expect } from 'bun:test'
import Long from 'long'
import {
    DataArray,
    DataBitSet,
    DataByte,
    DataFixedBitSet,
    DataInt,
    DataLong,
    DataNBT,
    DataObject,
    DataOptional,
    DataShort,
    DataString,
    DataUUID,
    DataWithDefault,
    VarInt,
    VarIntPrefixedByteArray,
    VarLong,
} from '~/data/types'
import {
    ClientBoundPacketCreator,
    ServerBoundPacketCreator,
    type PacketFormat,
    type PacketArguments,
    type PacketResult,
} from '~/net/packets/create'

const packetTester = async <T extends PacketFormat, U>(
    format: T,
    packet: PacketArguments<T>,
    processArg?: (data: PacketArguments<T>) => U,
    processRes?: (data: PacketResult<T>) => U
) => {
    const writePacket = ClientBoundPacketCreator(0x00, 'test', format)
    const readPacket = ServerBoundPacketCreator(0x00, 'test', format)
    const buffer = await writePacket(packet)
    const data = buffer.data.toJSON().data
    const res = await readPacket.deserialize(data, false)
    // console.log('Expected', packet)
    // console.log('Obtained', res.data)
    if (processRes && processArg) {
        expect(processRes(res.data)).toEqual(processArg(packet))
    } else if (processArg) {
        expect(res.data).toEqual(processArg(packet) as PacketResult<T>)
    } else {
        expect(res.data).toEqual(packet as PacketResult<T>)
    }
}

const performanceTester = async <T extends PacketFormat>(
    format: T,
    packet: PacketArguments<T>,
    iterations: number = 10000
) => {
    const writePacket = ClientBoundPacketCreator(0x00, 'test', format)
    const readPacket = ServerBoundPacketCreator(0x00, 'test', format)

    const now = performance.now()
    for (let i = 0; i < iterations; i++) {
        const buffer = await writePacket(packet)
        const data = buffer.data.toJSON().data
        await readPacket.deserialize(data, false)
    }
    console.log('perf:', (performance.now() - now) / iterations, 'ms')
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

    test('bitset', async () => {
        const bin = '011010101011101000'
        const data = BitSet.fromBinaryString(bin)
        await packetTester(
            {
                a: DataBitSet,
            },
            {
                a: data,
            },
            (data) => data.a.toString(),
            (data) => data.a.toString()
        )
    })

    test('fixed bitset', async () => {
        let bin = ''
        for (let i = 0; i < 24; i++) {
            bin += Math.random() > 0.5 ? '1' : '0'
            const data = BitSet.fromBinaryString(bin)
            await packetTester(
                {
                    a: DataFixedBitSet(bin.length),
                },
                {
                    a: data,
                },
                (data) => data.a.toString(),
                (data) => data.a.toString()
            )
        }
    })

    test('with default', async () => {
        const defaultValue = 'default'
        const format = {
            a: DataWithDefault(DataString, defaultValue),
        }
        await packetTester(format, {
            a: 'different_default',
        })
        await packetTester(
            format,
            {
                a: undefined,
            },
            (data) => {
                // Since undefined gets replaced by the default value
                return { a: defaultValue }
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

    test('varint perf', async () => {
        const format = {
            a: VarInt,
        }
        const packet = {
            a: Number.MAX_SAFE_INTEGER,
        }
        await performanceTester(format, packet)
    })

    test('dataobject perf', async () => {
        const format = {
            a: DataObject({
                b: DataObject({
                    c: DataObject({
                        d: DataObject({
                            e: DataInt,
                        }),
                    }),
                }),
                f: DataObject({
                    g: DataObject({
                        h: DataObject({
                            i: DataInt,
                        }),
                    }),
                }),
                j: DataObject({
                    k: DataObject({
                        l: DataObject({
                            m: DataInt,
                        }),
                    }),
                }),
            }),
        }
        const packet = {
            a: {
                b: { c: { d: { e: 42 } } },
                f: { g: { h: { i: 42 } } },
                j: { k: { l: { m: 42 } } },
            },
        }

        await performanceTester(format, packet)
    })

    test('NBT perf', async () => {
        const p = path.join(
            import.meta.dir,
            '..',
            'src',
            'data',
            'registry-data-packet.nbt'
        )
        const file = await Bun.file(p).arrayBuffer()
        const root = await NBT.read(file)

        const format = {
            nbt: DataNBT,
        }
        const packet = {
            nbt: root,
        }

        await performanceTester(format, packet, 1000)
    })
})
