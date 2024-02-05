import {
    FinishConfiguration,
    PlayKeepAlive,
    PluginMessage,
    PlayPong,
    ResourcePackResponse,
    ConfigurationClientInformation,
} from '~/packets/server'
import { HandlerBuilder } from '.'
import { ClientState } from '~/client'
import { FinishConfiguration as ClientFinishConfiguration } from '~/packets/client'

export const ConfigurationHandler = new HandlerBuilder({})
    .addPacket(ConfigurationClientInformation, async ({ client, packet }) => {
        client.info = packet
        return ClientFinishConfiguration({})
    })
    .addPacket(PluginMessage, async (args) => {})
    .addPacket(FinishConfiguration, async ({ client }) => {
        client.state = ClientState.PLAY
    })
    .addPacket(PlayKeepAlive, async (args) => {})
    .addPacket(PlayPong, async (args) => {})
    .addPacket(ResourcePackResponse, async (args) => {})
    .build('Configuration')
