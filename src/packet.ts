import { readByte, readInt, readShort, readString } from './formats'
import { reverseRecord } from './utils'
import { ConnectionHandler } from './handlers/connection'
import type { SocketState, SocketWithId } from './socket'

export const Packets = {
    STATUS: 'status',
    PING: 'ping',
    LEGACY_SERVER_LIST_PING: 'legacy_server_list_ping',
} as const

export const PacketIdToName = new Map([
    [0x00, Packets.STATUS],
    [0x01, Packets.PING],
    [0xfe, Packets.LEGACY_SERVER_LIST_PING],
] as const)

export const PacketNameToId = reverseRecord(PacketIdToName)

export type PacketName = keyof typeof PacketNameToId
export type PacketId = (typeof PacketNameToId)[keyof typeof PacketNameToId]
