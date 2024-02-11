import { ConfigurationHandler } from './configuration'
import { ClientState } from '~/client'
import { Handler, type RawHandlerArgs } from '.'
import { HandshakeHandler } from './handshake'
import { LoginHandler } from './login'
import { StatusHandler } from './status'
import { PlayHandler } from './play'
import { logHandler } from '~/logger'

export class MainHandler {
    subhandlers: {
        [key in Exclude<ClientState, ClientState.DISCONNECTED>]: Handler
    } = {
        [ClientState.HANDSHAKING]: HandshakeHandler,
        [ClientState.STATUS]: StatusHandler,
        [ClientState.LOGIN]: LoginHandler,
        [ClientState.CONFIGURATION]: ConfigurationHandler,
        [ClientState.PLAY]: PlayHandler,
    }

    constructor() {
        for (const key in this.subhandlers) {
            logHandler(
                this.subhandlers[parseInt(key) as keyof typeof this.subhandlers]
            )
        }
    }

    handle = async (args: RawHandlerArgs) => {
        if (args.client.state === ClientState.DISCONNECTED) {
            throw new Error('Client is disconnected')
        }
        // Dispatch to the appropriate subhandler based on the client's state
        return await this.subhandlers[args.client.state].handle(args)
    }
}
