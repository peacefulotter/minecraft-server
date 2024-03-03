import { PingResponse, StatusResponse } from '~/net/packets/client/status'
import { StatusPingRequest, StatusRequest } from '~/net/packets/server'
import { STATUS_RESPONSE } from '~/constants'
import { Handler } from '.'

export const StatusHandler = Handler.init('Status')

    .register(StatusRequest, async () => {
        return StatusResponse.serialize({ json: STATUS_RESPONSE })
    })

    .register(StatusPingRequest, async ({ packet }) => {
        return PingResponse.serialize(packet)
    })
