import type { TCPSocket } from 'bun'

export type SocketId = string
export type SocketWithId = TCPSocket & { id: SocketId }
