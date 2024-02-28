import type { PacketBuffer } from '~/net/PacketBuffer'

export const BYTE_SIZE = 1
export const SHORT_SIZE = 2
export const INT_SIZE = 4
export const FLOAT_SIZE = 4
export const DOUBLE_SIZE = 8
export const LONG_SIZE = 8
export const UUID_SIZE = 16

export interface Type<R, W = R> {
    read: (buffer: PacketBuffer) => Promise<R>
    write: (t: W) => Promise<PacketBuffer>
}

export type InnerWriteType<T extends Type<any>> = T extends Type<any, infer U>
    ? U
    : never

export type InnerReadType<T extends Type<any>> = T extends Type<infer U, any>
    ? U
    : never

export * from './simple'
