import { ByteArray, Long, String } from '~/types/basic'
import { createClientBoundPacket } from '../create'
import { STATUS_RESPONSE } from '~/constants'

export const PingResponse = createClientBoundPacket(0x01, {
    payload: Long,
})

export const StatusResponse = () =>
    createClientBoundPacket(0x00, {
        json: String,
    })({ json: STATUS_RESPONSE })
