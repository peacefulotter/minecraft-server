import { DataLong, DataString } from '~/data/types'
import { ClientBoundPacketCreator } from '../create'

export const PingResponse = ClientBoundPacketCreator(0x01, 'PingResponse', {
    payload: new DataLong(),
})

export const StatusResponse = ClientBoundPacketCreator(0x00, 'StatusResponse', {
    json: new DataString(),
})
