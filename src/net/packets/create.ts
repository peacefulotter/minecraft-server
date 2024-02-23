import { decrypt } from '~/auth'
import type { Type } from '~/data-types/basic'
import type { PacketId } from '.'

export type PacketFormat = { [key: string]: Type<any> }

type Packet<D, I extends PacketId = number, N extends string = string> = {
    id: I
    name: N
    data: D
}

// ========================== READ PACKET ==========================

export type ServerBoundPacket = Packet<ServerBoundPacketData<PacketFormat>>

// Get the packet return type format either from the format directly or from the packet
export type ServerBoundPacketData<
    T extends PacketFormat | ServerBoundPacketDeserializer
> = T extends PacketFormat
    ? {
          [key in keyof T]: T[key]['read'] extends (
              buffer: number[]
          ) => Promise<infer Ret> | infer Ret
              ? Ret
              : never
      }
    : T extends ServerBoundPacketDeserializer
    ? ReturnType<T['deserialize']> extends Promise<Packet<infer U>>
        ? U
        : never
    : never

const ServerBoundPacketReducer =
    (buffer: number[]) =>
    async <T extends PacketFormat>(
        acc: Promise<ServerBoundPacketData<T>>,
        [key, type]: [keyof T, Type<any>]
    ) => {
        return {
            ...(await acc),
            [key]: await type.read(buffer),
        }
    }

export const ServerBoundPacketCreator = <
    I extends PacketId = number,
    N extends string = string,
    T extends PacketFormat = PacketFormat
>(
    id: I,
    name: N,
    types: T
): ServerBoundPacketDeserializer<I, N, T> => ({
    id,
    name,
    deserialize: async (buf: number[], encripted: boolean) => {
        const buffer = encripted ? decrypt(buf) : buf
        const data = await Object.entries(types).reduce(
            ServerBoundPacketReducer(buffer),
            Promise.resolve({}) as Promise<ServerBoundPacketData<T>>
        )
        return { id, name, data }
    },
})

export type ServerBoundPacketCreator = typeof ServerBoundPacketCreator
export type ServerBoundPacketDeserializer<
    I extends PacketId = number,
    N extends string = string,
    T extends PacketFormat = PacketFormat
> = {
    id: I
    name: N
    deserialize: (
        buf: number[],
        encripted: boolean
    ) => Promise<Packet<ServerBoundPacketData<T>, I, N>>
}

// ========================== WRITE PACKET ==========================

export type ClientBoundPacket = Packet<Buffer>

type PacketArguments<T extends PacketFormat> = {
    [key in keyof T]: T[key]['write'] extends (arg: infer Arg) => any
        ? Arg
        : never
}

const ClientBoundPacketReducer =
    <T extends PacketFormat>(args: PacketArguments<T>) =>
    async (
        acc: Promise<Buffer>,
        [key, type]: [keyof T, Type<any>]
    ): Promise<Buffer> => {
        const part = await type.write(args[key])
        return Buffer.concat([await acc, part])
    }

export const ClientBoundPacketCreator =
    <
        I extends PacketId = number,
        N extends string = string,
        T extends PacketFormat = PacketFormat
    >(
        id: I,
        name: N,
        types: T
    ) =>
    async (args: PacketArguments<T>) => {
        const data = await Object.entries(types).reduce(
            ClientBoundPacketReducer(args),
            Promise.resolve(Buffer.from([]))
        )
        return { id, name, data } as Packet<Buffer, I, N>
    }

export type ClientBoundPacketCreator = typeof ClientBoundPacketCreator
export type ClientBoundPacketSerializer = ReturnType<ClientBoundPacketCreator>
