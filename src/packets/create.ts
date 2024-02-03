import { decrypt } from '~/auth'
import type { Type } from '~/types/basic'

type PacketCreation = { [key: string]: Type<any> }

// ========================== READ PACKET ==========================

type PacketReturn<T extends PacketCreation> = {
    [key in keyof T]: T[key]['read'] extends (buffer: number[]) => infer Ret
        ? Ret
        : never
}

export const createReadPacket = <T extends PacketCreation>(
    types: T
): ((buffer: number[], encripted: boolean) => PacketReturn<T>) => {
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

export const createWritePacket = <T extends PacketCreation>(
    types: T
): ((args: PacketArguments<T>) => Buffer) => {
    return (args: PacketArguments<T>) =>
        Object.keys(types).reduce(
            (acc, key) => Buffer.concat([acc, types[key].write(args[key])]),
            Buffer.from([])
        )
}
