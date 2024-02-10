import { decrypt } from '~/auth'
import type { AsyncType, Type } from '~/data-types/basic'
import type { PacketId } from '.'

export type PacketFormat = { [key: string]: Type<any> | AsyncType<any> }

abstract class Packet<
    I extends PacketId = number,
    S extends string = string,
    T extends PacketFormat = PacketFormat
> {
    constructor(
        public readonly id: I,
        public readonly name: S,
        public readonly types: T
    ) {}
}

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
> extends Packet<I, S, T> {
    parse = (buf: number[], encripted: boolean) => {
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
    [key in keyof T]: T[key]['write'] extends (arg: infer Arg) => any
        ? Arg
        : never
}

export class ClientBoundPacket {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly data: Buffer
    ) {}
}

export class ClientBoundPacketCreator<
    I extends PacketId = number,
    S extends string = string,
    T extends PacketFormat = PacketFormat
> extends Packet<I, S, T> {
    constructor(id: I, name: S, types: T) {
        super(id, name, types)
    }

    reducer =
        (args: PacketArguments<T>) =>
        async (acc: Promise<Buffer>, key: keyof T): Promise<Buffer> => {
            const part = await this.types[key].write(args[key])
            return Buffer.concat([await acc, part])
        }

    create = async (args: PacketArguments<T>) => {
        const data = await Object.keys(this.types).reduce(
            this.reducer(args),
            Promise.resolve(Buffer.from([]))
        )
        return new ClientBoundPacket(this.id, this.name, data)
    }
}
