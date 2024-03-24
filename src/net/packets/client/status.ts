import { DataLong, DataString } from '~/net/types'
import { ClientBoundPacketCreator } from '../create'

export const PingResponse = new ClientBoundPacketCreator(0x01, 'PingResponse', {
    payload: new DataLong(),
})

export const StatusResponse = new ClientBoundPacketCreator(
    0x00,
    'StatusResponse',
    {
        json: new DataString(),
    }
)
