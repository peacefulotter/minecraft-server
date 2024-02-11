import { DimensionResource } from 'region-types'
import {
    FinishConfiguration,
    PlayKeepAlive,
    PluginMessage,
    PlayPong,
    ResourcePackResponse,
    ConfigurationClientInformation,
} from '~/packets/server'
import { Handler } from '.'
import { ClientState } from '~/client'
import {
    FinishConfiguration as ClientFinishConfiguration,
    PlayLogin,
} from '~/packets/client'
import { GameMode } from '~/data-types/enum'
import { hashSeed } from '~/seed'

export const ConfigurationHandler = Handler.init('Configuration')

    .register(ConfigurationClientInformation, async ({ client, packet }) => {
        client.info = packet
        return ClientFinishConfiguration({})
    })

    .register(PluginMessage, async (args) => {})

    .register(FinishConfiguration, async ({ client }) => {
        client.state = ClientState.PLAY

        const seed = '42'

        return PlayLogin({
            entityId: 0,
            isHardcore: false,
            dimensionNames: [
                DimensionResource.overworld,
                DimensionResource.the_nether,
                DimensionResource.the_end,
            ],
            maxPlayers: 1,
            viewDistance: 2,
            simulationDistance: 2,
            reducedDebugInfo: false,
            enableRespawnScreen: false,
            doLimitedCrafting: false,
            dimensionType: DimensionResource.overworld,
            dimensionName: DimensionResource.overworld,
            hashedSeed: hashSeed(seed),
            gameMode: GameMode.SURVIVAL,
            previousGameMode: GameMode.UNDEFINED,
            isDebug: false,
            isFlat: true,
            death: undefined,
            portalCooldown: 0,
        })
    })
    .register(PlayKeepAlive, async (args) => {})

    .register(PlayPong, async (args) => {})

    .register(ResourcePackResponse, async (args) => {})
