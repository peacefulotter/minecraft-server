import { PacketBuffer } from '~/net/PacketBuffer'
import { type InnerReadType, type InnerWriteType, type Type } from '.'
import { DataBoolean } from './composite'
import { VarInt } from './var'
import type {
    ClientBoundPacketData,
    PacketFormat,
    ServerBoundPacketData,
} from '~/net/packets/create'

export class DataOptional<T extends Type<any>>
    implements Type<InnerReadType<T> | undefined, InnerWriteType<T>>
{
    boolean: Type<boolean> = new DataBoolean()
    constructor(private type: T) {}

    async read(buffer: PacketBuffer) {
        const isPresent = await this.boolean.read(buffer)
        return isPresent
            ? ((await this.type.read(buffer)) as InnerReadType<T>)
            : undefined
    }

    async write(t: InnerWriteType<T> | undefined) {
        if (t === undefined) {
            return await this.boolean.write(false)
        }
        const isPresent = await this.boolean.write(true)
        const buf = await this.type.write(t)
        return PacketBuffer.concat([isPresent.buffer, buf.buffer])
    }
}

export class DataArray<T extends Type<any>>
    implements Type<InnerReadType<T>[], InnerWriteType<T>[]>
{
    boolean: Type<boolean> = new DataBoolean()

    constructor(
        private type: T,
        private knownLength: number | undefined = undefined
    ) {}

    async read(buffer: PacketBuffer) {
        const size =
            this.knownLength === undefined
                ? await VarInt.read(buffer)
                : this.knownLength
        const arr: InnerReadType<T>[] = new Array(size)
        for (let i = 0; i < size; i++) {
            arr[i] = await this.type.read(buffer)
        }
        return arr
    }

    async write(ts: InnerWriteType<T>[]) {
        const length =
            this.knownLength === undefined
                ? await VarInt.write(ts.length)
                : Buffer.from([])
        const arr = new Array(ts.length)
        for (let i = 0; i < ts.length; i++) {
            arr[i] = await this.type.write(ts[i])
        }
        return PacketBuffer.concat([length, ...arr])
    }
}

export class DataObject<T extends PacketFormat>
    implements Type<ServerBoundPacketData<T>, ClientBoundPacketData<T>>
{
    constructor(private types: T) {}

    async read(buffer: PacketBuffer) {
        const obj = {} as ServerBoundPacketData<T>
        for (const [key, type] of Object.entries(this.types)) {
            obj[key as keyof typeof obj] = await type.read(buffer)
        }
        return obj
    }

    async write(t: ClientBoundPacketData<T>) {
        let buffers = [] as Buffer[]
        for (const [key, type] of Object.entries(this.types)) {
            const elt = await type.write(t[key as keyof typeof t])
            buffers.push(elt.buffer)
        }
        return PacketBuffer.concat(buffers)
    }
}

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

// // TODO: remove if not used
// export class DataWithDefault<T extends Type<any>>
//     implements Type<InnerReadType<T>, InnerWriteType<T> | undefined>
// {
//     constructor(
//         private type: Type<InnerReadType<T>, InnerWriteType<T>>,
//         private defaultValue: InnerWriteType<T>
//     ) {}

//     async read(buffer: PacketBuffer) {
//         return await this.type.read(buffer)
//     }
//     async write(t?: InnerWriteType<T>) {
//         const definedT = t === undefined ? this.defaultValue : t
//         return await this.type.write(definedT)
//     }
// }
