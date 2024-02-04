import { Long } from '~/types/basic'
import { ServerBoundPacket } from '../create'

export const StatusRequest = new ServerBoundPacket(0x00, 'StatusRequest', {})

export const StatusPingRequest = new ServerBoundPacket(0x01, 'Ping', {
    payload: Long,
})
