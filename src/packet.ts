import { reverseRecord } from './utils'

export const Packets = {
    STATUS: 'status',
    PING: 'ping',
    LOGIN: 'login',
    LEGACY_SERVER_LIST_PING: 'legacy_server_list_ping',
} as const

export const PacketIdToName = new Map([
    [0x00, Packets.STATUS],
    [0x01, Packets.PING],
    [0x02, Packets.LOGIN],
    [0xfe, Packets.LEGACY_SERVER_LIST_PING],
] as const)

export const PacketNameToId = reverseRecord(PacketIdToName)

console.log(PacketIdToName)

export type PacketName = keyof typeof PacketNameToId
export type PacketId = (typeof PacketNameToId)[keyof typeof PacketNameToId]
