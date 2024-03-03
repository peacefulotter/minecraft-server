import { DataLong } from '~/data/types'
import { ServerBoundPacketCreator } from '../create'

export const StatusRequest = new ServerBoundPacketCreator(
    0x00,
    'StatusRequest',
    {}
)

export const StatusPingRequest = new ServerBoundPacketCreator(0x01, 'Ping', {
    payload: new DataLong(),
})
