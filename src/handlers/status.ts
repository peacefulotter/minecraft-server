import { PingResponse, StatusResponse } from '~/packets/client/status'
import { StatusPingRequest, StatusRequest } from '~/packets/server'
import { HandlerBuilder } from '.'

export const StatusHandler = new HandlerBuilder({})
    .addPacket(StatusRequest, async () => {
        return StatusResponse()
    })
    .addPacket(StatusPingRequest, async ({ packet }) => {
        return PingResponse(packet)
    })
    .build('Status')
