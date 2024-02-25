import { decrypt } from '~/auth'
import type { InnerReadType, InnerWriteType, Type } from '~/data/types'
import type { PacketId } from '.'

export type PacketFormat = { [key: string]: Type<any> }

// Packet type after serialization (when performing a write)
export type PacketArguments<Format extends PacketFormat> = {
    [key in keyof Format]: InnerWriteType<Format[key]>
}

// Packet type after deserialization (when performing a read)
export type PacketResult<Format extends PacketFormat> = {
    [key in keyof Format]: InnerReadType<Format[key]>
}

type Packet<D, I extends PacketId = number, N extends string = string> = {
    id: I
    name: N
    data: D
}

// ========================== READ PACKET ==========================

// Get the packet return type format, equivalent to packet arguments
export type ServerBoundPacketData<T extends PacketFormat> = PacketResult<T>

export type ServerBoundPacket = Packet<ServerBoundPacketData<PacketFormat>>

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
    deserialize: async (buf: Buffer, encripted: boolean) => {
        const buffer = encripted ? decrypt(buf) : buf
        let data = {} as ServerBoundPacketData<T>
        let offset = 0
        for (const [key, type] of Object.entries(types)) {
            const { t: elt, length } = await type.read(buffer, offset)
            data[key as keyof typeof data] = elt
            offset += length
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
        buf: Buffer,
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
        let buffers = []
        for (const [key, type] of Object.entries(types)) {
            const elt = await type.write(args[key])
            buffers.push(elt)
        }
        const data = Buffer.concat(buffers)
        return { id, name, data } as Packet<Buffer, I, N>
    }

export type ClientBoundPacketCreator = typeof ClientBoundPacketCreator
export type ClientBoundPacketSerializer = ReturnType<ClientBoundPacketCreator>
