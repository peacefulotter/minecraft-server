export type PacketId = number

// import type { ServerBoundPacketDeserializer } from './create'

// import * as handshake from './server/handshake'
// import * as status from './server/status'
// import * as login from './server/login'
// import * as configuration from './server/configuration'
// import * as play from './server/play'

// const serverPackets = {
//     handshake: handshake,
//     status: status,
//     login: login,
//     configuration: configuration,
//     play: play,
// } as const

// type ServerStatePackets = typeof serverPackets

// // type ClientState = keyof ServerStatePackets

// type MapId<
//     T extends { readonly [name: string]: ServerBoundPacketDeserializer }
// > = {
//     [key in keyof T as T[key]['id']]: T[key]
// }

// type ServerPackets = {
//     [key in keyof ServerStatePackets]: MapId<ServerStatePackets[key]>
// }

// // map server packets to an object with packet id as key
// export const SERVER_PACKETS = Object.fromEntries(
//     Object.entries(serverPackets).map(([state, packetsState]) => [
//         state,
//         Object.fromEntries(
//             Object.entries(packetsState).map(([_, packet]) => [
//                 packet.id.toString(),
//                 packet,
//             ])
//         ),
//     ])
// ) as ServerPackets
