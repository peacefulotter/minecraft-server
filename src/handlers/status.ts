import { PingResponse, StatusResponse } from '~/packets/client/status'
import { StatusPingRequest, StatusRequest } from '~/packets/server'
import { HandlerBuilder } from '.'
import { STATUS_RESPONSE } from '~/constants'

export const StatusHandler = new HandlerBuilder({})
    .addPacket(StatusRequest, async () => {
        return StatusResponse.create({ json: STATUS_RESPONSE })
    })
    .addPacket(StatusPingRequest, async ({ packet }) => {
        return PingResponse.create(packet)
    })
    .build('Status')
