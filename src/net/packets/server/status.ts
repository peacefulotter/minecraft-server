import { DataLong } from '~/data/types'
import { ServerBoundPacketCreator } from '../create'

export const StatusRequest = ServerBoundPacketCreator(0x00, 'StatusRequest', {})

export const StatusPingRequest = ServerBoundPacketCreator(0x01, 'Ping', {
    payload: new DataLong(),
})
