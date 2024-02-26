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
    const res = await readPacket.deserialize(buffer.data, false)
    console.log('Expected', packet)
    console.log('Obtained', res.data)
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
        await readPacket.deserialize(buffer.data, false)
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
            },
            (data) => data.uuid.toString(),
            (data) => data.uuid.toString()
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

    test('int', async () => {
        const format = {
            a: DataInt,
        }
        for (let i = 0; i < 100; i++) {
            await packetTester(format, {
                a: Math.round((Math.random() - 0.5) * 1000000),
            })
        }
    })

    test('array', async () => {
        const format = {
            arr: DataArray(DataString),
        }
        await packetTester(format, {
            arr: ['aaa', 'bbb', 'ccc'],
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
        for (let i = 0; i < 100; i++) {
            const data = Long.fromNumber(
                Math.round((Math.random() - 0.5) * Number.MAX_SAFE_INTEGER)
            )
            await packetTester(
                {
                    a: DataLong,
                },
                {
                    a: data,
                }
            )
        }
    })

    test('bitset', async () => {
        const test = async (s: string) => {
            const data = BitSet.fromBinaryString(s)
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
        }

        const bin = '011010101011101000'
        await test(bin)

        let bin2 = ''
        for (let i = 0; i < 24; i++) {
            bin2 += Math.random() > 0.5 ? '1' : '0'
            await test(bin2)
        }
    })

    test('fixed bitset', async () => {
        const test = async (s: string) => {
            const data = BitSet.fromBinaryString(s)
            await packetTester(
                {
                    a: DataFixedBitSet(s.length),
                },
                {
                    a: data,
                },
                (data) => data.a.toString(),
                (data) => data.a.toString()
            )
        }

        let bin = ''
        for (let i = 0; i < 24; i++) {
            bin += Math.random() > 0.5 ? '1' : '0'
            await test(bin)
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

        const packet: PacketArguments<typeof format> = {
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

        const formatter = (data: PacketArguments<typeof format>) => {
            return {
                ...data,
                h: data.h.toString(),
                g: data.g.toString(),
                m: data.m.toString(),
            }
        }
        await packetTester(format, packet, formatter, formatter)
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

    test('string perf', async () => {
        const format = {
            a: DataString,
        }
        const packet = {
            a: 'a'.repeat(32767),
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
