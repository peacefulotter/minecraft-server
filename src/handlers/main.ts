import { ConfigurationHandler } from './configuration'
import { ClientState } from '~/client'
import type { Handler, HandlerArgs } from '.'
import { HandshakeHandler } from './handshake'
import { LoginHandler } from './login'
import { StatusHandler } from './status'
import { PlayHandler } from './play'

export class MainHandler implements Handler {
    subhandlers: { [key in ClientState]: Handler } = {
        [ClientState.HANDSHAKING]: new HandshakeHandler(),
        [ClientState.STATUS]: new StatusHandler(),
        [ClientState.LOGIN]: new LoginHandler(),
        [ClientState.CONFIGURATION]: new ConfigurationHandler(),
        [ClientState.PLAY]: new PlayHandler(),
    }

    handle = async (args: HandlerArgs) => {
        // Dispatch to the appropriate subhandler based on the client's state
        return await this.subhandlers[args.client.state].handle(args)
    }
}
