import { decrypt } from '~/auth'
import type { PacketId } from '~/packet'
import type { Type } from '~/data-types/basic'

export type PacketFormat = { [key: string]: Type<any> }

// ========================== READ PACKET ==========================

// Get the packet return type format either from the format directly or from the packet
export type ParsedServerBoundPacket<
    T extends PacketFormat | ServerBoundPacket<number, string, any>
> = T extends PacketFormat
    ? {
          [key in keyof T]: T[key]['read'] extends (
              buffer: number[]
          ) => infer Ret
              ? Ret
              : never
      }
    : T extends ServerBoundPacket<number, string, infer U>
    ? ParsedServerBoundPacket<U>
    : never

export type ServerBoundPacketParser<T extends PacketFormat> = (
    buf: number[],
    encripted: boolean
) => ParsedServerBoundPacket<T>

export class ServerBoundPacket<
    I extends PacketId = number,
    S extends string = string,
    T extends PacketFormat = PacketFormat
> {
    constructor(
        public readonly id: I,
        public readonly name: S,
        public readonly types: T
    ) {
        this.id = id
        this.name = name
        this.types = types
    }

    parse: ServerBoundPacketParser<T> = (buf: number[], encripted: boolean) => {
        const buffer = encripted ? decrypt(buf) : buf
        const computed = Object.entries(this.types).reduce(
            (acc, [key, type]) => ({ ...acc, [key]: type.read(buffer) }),
            {} as ParsedServerBoundPacket<T>
        )
        return computed
    }
}

// ========================== WRITE PACKET ==========================

type PacketArguments<T extends PacketFormat> = {
    [key in keyof T]: T[key]['write'] extends (arg: infer Arg) => Buffer
        ? Arg
        : never
}

export type ClientBoundPacket = {
    packetId: number
    buffer: Buffer
}

export const createClientBoundPacket = <T extends PacketFormat>(
    packetId: number,
    types: T
): ((args: PacketArguments<T>) => ClientBoundPacket) => {
    return (args: PacketArguments<T>) => ({
        packetId,
        buffer: Object.keys(types).reduce(
            (acc, key) => Buffer.concat([acc, types[key].write(args[key])]),
            Buffer.from([])
        ),
    })
}
