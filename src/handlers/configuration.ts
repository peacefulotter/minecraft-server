import {
    PlayClientInformation,
    FinishConfiguration,
    PlayKeepAlive,
    PluginMessage,
    PlayPong,
    ResourcePackResponse,
} from '~/packets/server'
import { Handler, type Args, link } from '.'
import { ClientState } from '~/client'
import { FinishConfiguration as ClientFinishConfiguration } from '~/packets/client'

export class ConfigurationHandler extends Handler {
    constructor() {
        super('Configuration', [
            link(
                PlayClientInformation,
                ConfigurationHandler.onClientInformation
            ),
            link(PluginMessage, ConfigurationHandler.onPluginMessage),
            link(
                FinishConfiguration,
                ConfigurationHandler.onFinishConfiguration
            ),
            link(PlayKeepAlive, ConfigurationHandler.onKeepAlive),
            link(PlayPong, ConfigurationHandler.onPong),
            link(
                ResourcePackResponse,
                ConfigurationHandler.onResourcePackResponse
            ),
        ])
    }

    static onClientInformation = async ({
        client,
        packet,
    }: Args<typeof PlayClientInformation>) => {
        console.log(
            '====================================',
            'handleClientInformation'
        )
        client.info = packet
        console.log(packet)

        const response = ClientFinishConfiguration({})
        client.state = ClientState.PLAY
        return response
    }

    static onPluginMessage = async (args: Args<typeof PluginMessage>) => {
        console.log(
            '====================================',
            'handlePluginMessage'
        )
    }

    static onFinishConfiguration = async (
        args: Args<typeof FinishConfiguration>
    ) => {
        console.log(
            '====================================',
            'handleFinishConfiguration'
        )
    }

    static onKeepAlive = async (args: Args<typeof PlayKeepAlive>) => {
        console.log('====================================', 'handleKeepAlive')
    }

    static onPong = async (args: Args<typeof PlayPong>) => {
        console.log('====================================', 'handlePong')
    }

    static onResourcePackResponse = async (
        args: Args<typeof ResourcePackResponse>
    ) => {
        console.log(
            '====================================',
            'handleResourcePackResponse'
        )
    }
}
