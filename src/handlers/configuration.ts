import {
    PlayClientInformation,
    FinishConfiguration,
    PlayKeepAlive,
    PluginMessage,
    PlayPong,
    ResourcePackResponse,
} from '~/packets/server'
import { HandlerBuilder } from '.'
import { ClientState } from '~/client'
import { FinishConfiguration as ClientFinishConfiguration } from '~/packets/client'

export const ConfigurationHandler = new HandlerBuilder({})
    .addPacket(PlayClientInformation, async ({ client, packet }) => {
        console.log(
            '====================================',
            'handleClientInformation'
        )
        client.info = packet
        console.log(packet)

        const response = ClientFinishConfiguration({})
        client.state = ClientState.PLAY
        return response
    })
    .addPacket(PluginMessage, async (args) => {
        console.log(args.packet)
    })
    .addPacket(FinishConfiguration, async (args) => {
        console.log(args.packet)
    })
    .addPacket(PlayKeepAlive, async (args) => {
        console.log(args.packet)
    })
    .addPacket(PlayPong, async (args) => {
        console.log(args.packet)
    })
    .addPacket(ResourcePackResponse, async (args) => {
        console.log(args.packet)
    })
    .build('Configuration')
