import { ConfigurationHandler } from './configuration'
import { ClientState } from '~/client'
import { Handler, type RawHandlerArgs } from '.'
import { HandshakeHandler } from './handshake'
import { LoginHandler } from './login'
import { StatusHandler } from './status'
import { PlayHandler } from './play'

export class MainHandler {
    subhandlers: { [key in ClientState]: Handler } = {
        [ClientState.HANDSHAKING]: HandshakeHandler,
        [ClientState.STATUS]: StatusHandler,
        [ClientState.LOGIN]: LoginHandler,
        [ClientState.CONFIGURATION]: ConfigurationHandler,
        [ClientState.PLAY]: PlayHandler,
    }

    handle = async (args: RawHandlerArgs) => {
        // Dispatch to the appropriate subhandler based on the client's state
        return await this.subhandlers[args.client.state].handle(args)
    }
}
