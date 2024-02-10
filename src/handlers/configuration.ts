import { DimensionResource } from 'region-types'
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
import {
    FinishConfiguration as ClientFinishConfiguration,
    PlayLogin,
} from '~/packets/client'
import { GameMode } from '~/data-types/enum'
import { hashSeed } from '~/seed'

export const ConfigurationHandler = new HandlerBuilder({})
    .addPacket(ConfigurationClientInformation, async ({ client, packet }) => {
        client.info = packet
        return ClientFinishConfiguration.create({})
    })
    .addPacket(PluginMessage, async (args) => {})
    .addPacket(FinishConfiguration, async ({ client }) => {
        client.state = ClientState.PLAY

        const seed = '42'

        return PlayLogin.create({
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
            hasDeathLocation: false,
            deathDimensionName: null,
            deathLocation: null,
            portalCooldown: 0,
        })
    })
    .addPacket(PlayKeepAlive, async (args) => {})
    .addPacket(PlayPong, async (args) => {})
    .addPacket(ResourcePackResponse, async (args) => {})
    .build('Configuration')
