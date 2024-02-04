import { PingResponse, StatusResponse } from '~/packets/client/status'
import { Handler, type Args, link } from '.'
import { StatusPingRequest, StatusRequest } from '~/packets/server'

export class StatusHandler extends Handler {
    constructor() {
        super('Status', [
            link(StatusRequest, StatusHandler.onStatusRequest),
            link(StatusPingRequest, StatusHandler.onPingRequest),
        ])
    }

    static onStatusRequest = async () => {
        return StatusResponse()
    }

    static onPingRequest = async ({
        packet,
    }: Args<typeof StatusPingRequest>) => {
        return PingResponse(packet)
    }
}
