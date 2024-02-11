import { DataLong, DataString } from '~/data-types/basic'
import { ClientBoundPacketCreator } from '../create'

export const PingResponse = ClientBoundPacketCreator(0x01, 'PingResponse', {
    payload: DataLong,
})

export const StatusResponse = ClientBoundPacketCreator(0x00, 'StatusResponse', {
    json: DataString,
})
