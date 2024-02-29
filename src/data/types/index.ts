import type { PacketBuffer } from '~/net/PacketBuffer'

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
export * from './var'
export * from './composite'
export * from './meta'
