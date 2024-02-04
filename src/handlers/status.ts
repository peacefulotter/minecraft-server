import { StatusResponse, PingResponse } from '~/packets/client-bound'
import type { Handler, HandlerArgs } from '.'

export class StatusHandler implements Handler {
    handle = async (args: HandlerArgs) => {
        switch (args.packetId) {
            case 0x00:
                return this.handleStatusRequest()
            case 0x01:
                return this.handlePingRequest(args)
            default:
                throw new Error(
                    `Unknown packet id: ${args.packetId} for state: status`
                )
        }
    }

    handleStatusRequest = () => {
        return StatusResponse()
    }

    handlePingRequest = ({ buffer }: HandlerArgs) => {
        return PingResponse({ payload: Buffer.from(buffer) })
    }
}
