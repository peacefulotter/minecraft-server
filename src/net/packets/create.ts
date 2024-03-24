import { decrypt } from '~/auth'
import type { InnerReadType, InnerWriteType, Type } from '~/net/types'
import type { PacketId } from '.'
import { PacketBuffer } from '../PacketBuffer'

export type PacketFormat = { [key: string]: Type<any> }

type Packet<D, I extends PacketId = number, N extends string = string> = {
    id: I
    name: N
    data: D
    loggable: boolean
}

// ========================== READ PACKET ==========================

// Packet type after deserialization (when performing a read)
export type ServerBoundPacketData<Format extends PacketFormat> = {
    [key in keyof Format]: InnerReadType<Format[key]>
}

export type ServerBoundPacket<
    I extends PacketId = number,
    N extends string = string,
    T extends PacketFormat = PacketFormat
> = Packet<ServerBoundPacketData<T>, I, N>

export type ServerBoundPacketDataFromCreator<
    C extends ServerBoundPacketCreator
> = C extends ServerBoundPacketCreator<any, any, infer T>
    ? ServerBoundPacketData<T>
    : never

export class ServerBoundPacketCreator<
    I extends PacketId = number,
    N extends string = string,
    T extends PacketFormat = PacketFormat
> {
    constructor(
        public readonly id: I,
        public readonly name: N,
        private readonly types: T,
        public readonly loggable: boolean = true
    ) {}

    async deserialize(
        buf: PacketBuffer,
        encripted: boolean
    ): Promise<ServerBoundPacket<I, N, T>> {
        const buffer = encripted ? decrypt(buf) : buf
        // console.log(buffer)
        let data = {} as ServerBoundPacketData<T>
        for (const [key, type] of Object.entries(this.types)) {
            // console.log(
            //     'before',
            //     buffer.readOffset,
            //     key,
            //     buffer.length,
            //     'got:',
            //     buffer.get(0, true)
            // )
            data[key as keyof typeof data] = await type.read(buffer)
            // console.log(
            //     'after ',
            //     buffer.readOffset,
            //     data[key as keyof typeof data]
            // )
        }
        return { id: this.id, name: this.name, data, loggable: this.loggable }
    }
}

// ========================== WRITE PACKET ==========================

// Packet type after serialization (when performing a write)
export type ClientBoundPacketData<Format extends PacketFormat> = {
    [key in keyof Format]: InnerWriteType<Format[key]>
}

export type ClientBoundPacket = Packet<PacketBuffer>

export class ClientBoundPacketCreator<
    I extends PacketId = number,
    N extends string = string,
    T extends PacketFormat = PacketFormat
> {
    constructor(
        public readonly id: I,
        public readonly name: N,
        private readonly types: T,
        public readonly loggable: boolean = true
    ) {}

    async serialize(args: ClientBoundPacketData<T>) {
        let buffers = []
        for (const [key, type] of Object.entries(this.types)) {
            // console.log('before', key, args[key])
            const elt = await type.write(args[key])
            // console.log('after ', elt)
            buffers.push(elt)
        }
        const data = PacketBuffer.concat(buffers)

        return { id: this.id, name: this.name, data, loggable: this.loggable }
    }
}
