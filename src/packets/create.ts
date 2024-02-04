import { decrypt } from '~/auth'
import type { Type } from '~/types/basic'

type PacketCreation = { [key: string]: Type<any> }

// ========================== READ PACKET ==========================

type PacketReturn<T extends PacketCreation> = {
    [key in keyof T]: T[key]['read'] extends (buffer: number[]) => infer Ret
        ? Ret
        : never
}

export type ServerBoundPacket<T extends PacketCreation> = (
    buf: number[],
    encripted: boolean
) => PacketReturn<T>

export const createReadPacket = <T extends PacketCreation>(
    types: T
): ServerBoundPacket<T> => {
    return (buf: number[], encripted: boolean) => {
        const buffer = encripted ? decrypt(buf) : buf
        const computed = Object.entries(types).reduce(
            (acc, [key, type]) => ({ ...acc, [key]: type.read(buffer) }),
            {} as PacketReturn<T>
        )
        return computed
    }
}

// ========================== WRITE PACKET ==========================

type PacketArguments<T extends PacketCreation> = {
    [key in keyof T]: T[key]['write'] extends (arg: infer Arg) => Buffer
        ? Arg
        : never
}

export type ClientBoundPacket = {
    packetId: number
    buffer: Buffer
}

export const createWritePacket = <T extends PacketCreation>(
    types: T,
    packetId: number
): ((args: PacketArguments<T>) => ClientBoundPacket) => {
    return (args: PacketArguments<T>) => ({
        packetId,
        buffer: Object.keys(types).reduce(
            (acc, key) => Buffer.concat([acc, types[key].write(args[key])]),
            Buffer.from([])
        ),
    })
}
