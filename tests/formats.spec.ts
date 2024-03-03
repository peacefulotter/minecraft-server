import path from 'path'
import * as NBT from 'nbtify'
import { parseUUID } from '@minecraft-js/uuid'
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
    VarInt,
    VarIntPrefixedByteArray,
    VarLong,
} from '~/data/types'
import {
    ClientBoundPacketCreator,
    ServerBoundPacketCreator,
    type PacketFormat,
    type ClientBoundPacketData,
    type ServerBoundPacketData,
} from '~/net/packets/create'

const packetTester = async <T extends PacketFormat, U>(
    format: T,
    packet: ClientBoundPacketData<T>,
    processArg?: (data: ClientBoundPacketData<T>) => U | Promise<U>,
    processRes?: (data: ServerBoundPacketData<T>) => U | Promise<U>
) => {
    const writePacket = ClientBoundPacketCreator(0x00, 'test', format)
    const readPacket = ServerBoundPacketCreator(0x00, 'test', format)
    const buffer = await writePacket(packet)
    const res = await readPacket.deserialize(buffer.data, false)
    // console.log('Expected', packet)
    // console.log('Obtained', res.data)
    if (processRes && processArg) {
        expect(await processRes(res.data)).toEqual(await processArg(packet))
    } else if (processArg) {
        expect(res.data).toEqual(
            (await processArg(packet)) as ServerBoundPacketData<T>
        )
    } else {
        expect(res.data).toEqual(packet as ServerBoundPacketData<T>)
    }
}

const performanceTester = async <T extends PacketFormat>(
    format: T,
    packet: ClientBoundPacketData<T>,
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
        const uuid = '7ed9e77e-34b8-400e-b684-9093c550b4f9'
        await packetTester(
            {
                uuid: new DataUUID(),
            },
            {
                uuid: parseUUID(uuid),
            },
            (data) => data.uuid.toString(),
            (data) => data.uuid.toString()
        )
    })

    test('optional', async () => {
        const format = {
            opt: new DataOptional(new DataString()),
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
            a: new DataInt(),
        }
        for (let i = 0; i < 100; i++) {
            await packetTester(format, {
                a: Math.round((Math.random() - 0.5) * 1000000),
            })
        }
    })

    test('string', async () => {
        const format = {
            a: new DataString(),
        }
        await packetTester(format, {
            a: 'hello world',
        })

        await packetTester(format, {
            a: 'a'.repeat(32767),
        })
    })

    test('array', async () => {
        const format = {
            arr: new DataArray(new DataString()),
        }
        await packetTester(format, {
            arr: ['aaa', 'bbb', 'ccc'],
        })
    })

    test('object', async () => {
        const format = {
            obj: new DataObject({
                a: new DataString(),
                b: new DataInt(),
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
                    a: new DataLong(),
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
                    a: new DataBitSet(),
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
                    a: new DataFixedBitSet(s.length),
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

    // test('with default', async () => {
    //     const defaultValue = 'default'
    //     const format = {
    //         a: new DataWithDefault(new DataString(), defaultValue),
    //     }
    //     await packetTester(format, {
    //         a: 'different_default',
    //     })
    //     await packetTester(
    //         format,
    //         {
    //             a: undefined,
    //         },
    //         (data) => {
    //             // Since undefined gets replaced by the default value
    //             return { a: defaultValue }
    //         }
    //     )
    // })

    test('is identity when writing -> reading', async () => {
        const format = {
            a: new DataByte(),
            b: new VarIntPrefixedByteArray(),
            c: new DataShort(),
            d: new DataInt(),
            e: new DataString(),
            f: new VarInt(),
            g: new VarLong(),
            h: new DataUUID(),
            i: new DataOptional(new DataString()),
            j: new DataObject({
                a: new DataString(),
                b: new DataInt(),
            }),
            k: new DataArray(new DataString()),
            l: new DataOptional(
                new DataObject({
                    a: new DataString(),
                    b: new DataArray(new DataInt()),
                })
            ),
            m: new DataLong(),
        }

        const packet: ClientBoundPacketData<typeof format> = {
            a: 42,
            b: Buffer.from([1, 2, 3]),
            c: 5,
            d: 6,
            e: 'hello world',
            f: 255,
            g: Long.fromNumber(Date.now()),
            h: parseUUID('7ed9e77e-34b8-400e-b684-9093c550b4f9'),
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

        const formatter = (data: ClientBoundPacketData<typeof format>) => {
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
            a: new DataObject({
                b: new DataObject({
                    c: new DataObject({
                        d: new DataObject({
                            e: new DataInt(),
                        }),
                    }),
                }),
                f: new DataObject({
                    g: new DataObject({
                        h: new DataObject({
                            i: new DataInt(),
                        }),
                    }),
                }),
                j: new DataObject({
                    k: new DataObject({
                        l: new DataObject({
                            m: new DataInt(),
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
            a: new DataString(),
        }
        const packet = {
            a: 'a'.repeat(132767),
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

        const format = { a: new DataInt(), nbt: new DataNBT() }

        await packetTester(format, { a: 42, nbt: file }, async (d) => ({
            ...d,
            nbt: new NBT.NBTData(await NBT.read(file), {
                rootName: null,
            }),
        }))

        await packetTester(
            format,
            {
                a: 42,
                nbt: file,
            },
            async (d) => ({
                ...d,
                nbt: new NBT.NBTData(await NBT.read(file), {
                    rootName: null,
                }),
            })
        )

        await performanceTester(
            {
                nbt: new DataNBT(),
            },
            {
                nbt: file,
            },
            1000
        )
    })
})
