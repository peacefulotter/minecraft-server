import { DataByteArray, DataLong, DataString } from '~/data-types/basic'
import { createClientBoundPacket } from '../create'
import { STATUS_RESPONSE } from '~/constants'

export const PingResponse = createClientBoundPacket(0x01, {
    payload: DataLong,
})

export const StatusResponse = () =>
    createClientBoundPacket(0x00, {
        json: DataString,
    })({ json: STATUS_RESPONSE })
