import { PingResponse, StatusResponse } from '~/packets/client/status'
import { StatusPingRequest, StatusRequest } from '~/packets/server'
import { STATUS_RESPONSE } from '~/constants'
import { Handler } from '.'

export const StatusHandler = Handler.init('Status')

    .register(StatusRequest, async () => {
        return StatusResponse({ json: STATUS_RESPONSE })
    })

    .register(StatusPingRequest, async ({ packet }) => {
        return PingResponse(packet)
    })
