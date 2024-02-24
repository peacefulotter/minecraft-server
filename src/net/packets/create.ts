import { decrypt } from '~/auth'
import type { Type } from '~/data-types/basic'
import type { PacketId } from '.'

export type PacketFormat = { [key: string]: Type<any> }

export type InnerType<T extends Type<any>> = T extends Type<any, infer U>
    ? U
    : never

export type PacketArguments<Format extends PacketFormat> = {
    [key in keyof Format]: InnerType<Format[key]>
}

type Packet<D, I extends PacketId = number, N extends string = string> = {
    id: I
    name: N
    data: D
}

// ========================== READ PACKET ==========================

export type ServerBoundPacket = Packet<ServerBoundPacketData<PacketFormat>>

// Get the packet return type format, equivalent to packet arguments
export type ServerBoundPacketData<T extends PacketFormat> = PacketArguments<T>

export type ServerBoundPacketDataFromDeserializer<
    T extends ServerBoundPacketDeserializer
> = T extends ServerBoundPacketDeserializer<any, any, infer Format>
    ? ServerBoundPacketData<Format>
    : never

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
        let data = {} as ServerBoundPacketData<T>
        for (const [key, type] of Object.entries(types)) {
            const elt = await type.read(buffer)
            data[key as keyof typeof data] = elt
        }
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
        let data = Buffer.from([])
        for (const [key, type] of Object.entries(types)) {
            const elt = await type.write(args[key])
            data = Buffer.concat([data, elt])
        }
        return { id, name, data } as Packet<Buffer, I, N>
    }

export type ClientBoundPacketCreator = typeof ClientBoundPacketCreator
export type ClientBoundPacketSerializer = ReturnType<ClientBoundPacketCreator>
