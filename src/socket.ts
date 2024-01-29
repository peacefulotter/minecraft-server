import type { TCPSocket } from 'bun'
import type { ConnectionState } from './handlers/connection'

export type SocketId = string
export type SocketWithId = TCPSocket & { id: SocketId }
export type SocketState = {
    connection: ConnectionState
}
