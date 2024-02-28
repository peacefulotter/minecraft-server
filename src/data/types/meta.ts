import { PacketBuffer } from '~/net/PacketBuffer'
import type { Type } from '.'
import { DataBoolean } from '../types'

class _DataOptional<T> implements Type<T | undefined> {
    constructor(private type: Type<T>) {}

    async read(buffer: PacketBuffer) {
        const isPresent = await DataBoolean.read(buffer)
        return isPresent ? await this.type.read(buffer) : undefined
    }

    async write(t: T | undefined) {
        if (t === undefined) {
            return await DataBoolean.write(false)
        }
        const isPresent = await DataBoolean.write(true)
        const buf = await this.type.write(t)
        return PacketBuffer.concat([isPresent.buffer, buf.buffer])
    }
}

export const DataArray = <T>(type: Type<T>) => ({
    read: async (buffer: PacketBuffer) => {
        const size = await VarInt.read(buffer)
        const arr: T[] = new Array(size)
        for (let i = 0; i < size; i++) {
            arr[i] = await type.read(buffer)
        }
        return arr
    },

    write: async (ts: T[]) => {
        const length = await VarInt.write(ts.length)
        const arr = new Array(ts.length)
        for (let i = 0; i < ts.length; i++) {
            arr[i] = await type.write(ts[i])
        }
        return PacketBuffer.concat([length, ...arr])
    },
})

export const DataObject = <T extends PacketFormat>(
    types: T
): Type<PacketArguments<T>> => ({
    read: async (buffer: PacketBuffer) => {
        const obj = {} as PacketArguments<T>
        for (const [key, type] of Object.entries(types)) {
            obj[key as keyof typeof obj] = await type.read(buffer)
        }
        return obj
    },

    write: async (t: PacketArguments<T>) => {
        let buffers = [] as Buffer[]
        for (const [key, type] of Object.entries(types)) {
            const elt = await type.write(t[key as keyof typeof t])
            buffers.push(elt.buffer)
        }
        return PacketBuffer.concat(buffers)
    },
})

// Make it possible to send a packet with optional fields (?)
// Using a mask to know which fields are present
// need to consider if this is worth implementing

// export const DataObjectOptional = <T extends PacketFormat>(
//     types: T,
//     masks: Record<keyof T, number>
// ): Type<PacketArguments<T>> => ({
//     read: async (buffer: number[]) => {
//         const resolved = await Object.entries(types).reduce(
//             (acc, [key, type]) =>
//                 acc.then(async (acc) => {
//                     acc.push([key, await type.read(buffer)])
//                     return acc
//                 }),
//             Promise.resolve([] as [keyof T, Promise<any>][])
//         )
//         return Object.fromEntries(resolved) as PacketArguments<T>
//     },

//     write: async (t: PacketArguments<T>) => {
//         return await Object.entries(types).reduce(
//             (acc, [key, type]) =>
//                 acc.then(async (acc) =>
//                     PacketBuffer.concat([acc, await type.write(t[key])])
//                 ),
//             Promise.resolve(PacketBuffer.from([]))
//         )
//     },
// })

// TODO: remove if not used
export const DataWithDefault = <T>(
    type: Type<T>,
    defaultValue: T
): Type<T, T | undefined> => ({
    read: async (buffer: PacketBuffer) => {
        return await type.read(buffer)
    },
    write: async (t?: T) => {
        const definedT = t === undefined ? defaultValue : t
        return await type.write(definedT)
    },
})

export const DataOptional = <T>(type: Type<T>) => new _DataOptional(type)
