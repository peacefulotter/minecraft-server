import type { TCPSocket } from 'bun'

export type SocketId = number
export type SocketWithId = TCPSocket & { id: SocketId }
