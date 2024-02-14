import * as NBT from 'nbtify'
import { DimensionResource } from 'region-types'
import {
    FinishConfiguration,
    PlayServerBoundKeepAlive,
    PluginMessage,
    PlayPong,
    ResourcePackResponse,
    ConfigurationClientInformation,
    ConfigurationServerBoundKeepAlive,
} from '~/net/packets/server'
import { Handler } from '.'
import { ClientState } from '~/net/client'
import {
    ChunkDataAndUpdateLight,
    FinishConfiguration as ClientFinishConfiguration,
    GameEvent,
    PlayLogin,
    PlayerPositionFlag,
    SetCenterChunk,
    SetDefaultSpawnPosition,
    SynchronizePlayerPosition,
} from '~/net/packets/client'
import { GameMode } from '~/data-types/enum'
import { hashSeed } from '~/seed'
import type { ClientBoundPacket } from '~/net/packets/create'
import BitSet from 'bitset'
import { chunk } from '~/world/chunk'
import { SPAWN_POSITION, WORLD_SEED } from '~/constants'

export const ConfigurationHandler = Handler.init('Configuration')

    .register(ConfigurationClientInformation, async ({ client, packet }) => {
        client.info = packet
        return ClientFinishConfiguration({})
    })

    .register(PluginMessage, async (args) => {})

    .register(FinishConfiguration, async ({ client }) => {
        client.state = ClientState.PLAY

        const chunks: ClientBoundPacket[] = []
        const size = 3
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {
                chunks.push(
                    await ChunkDataAndUpdateLight({
                        chunkX: i,
                        chunkZ: j,
                        heightMaps: new NBT.NBTData({}, { rootName: null }),
                        data: Buffer.from(chunk), // (terrainMap.get('0.0') as any).terrain,
                        blockEntity: [],
                        skyLightMask: new BitSet(0),
                        blockLightMask: new BitSet(0),
                        emptySkyLightMask: new BitSet(0),
                        emptyBlockLightMask: new BitSet(0),
                        skyLightArray: [],
                        blockLightArray: [],
                    })
                )
            }
        }

        return [
            await PlayLogin({
                entityId: 124, // see data-types/entities.ts
                isHardcore: false,
                dimensionNames: [
                    DimensionResource.overworld,
                    DimensionResource.the_nether,
                    DimensionResource.the_end,
                ],
                maxPlayers: 0, // ignored
                viewDistance: 5,
                simulationDistance: 5,
                reducedDebugInfo: false,
                enableRespawnScreen: false,
                doLimitedCrafting: false,
                dimensionType: DimensionResource.overworld,
                dimensionName: DimensionResource.overworld,
                hashedSeed: hashSeed(WORLD_SEED),
                gameMode: GameMode.SURVIVAL,
                previousGameMode: GameMode.UNDEFINED,
                isDebug: false,
                isFlat: false,
                death: undefined,
                portalCooldown: 0,
            }),
            await SetDefaultSpawnPosition({
                location: SPAWN_POSITION,
                angle: 0,
            }),
            await SetCenterChunk({ chunkX: 0, chunkZ: 0 }),
            await GameEvent({
                event: {
                    effect: 13,
                    value: 0,
                },
            }),
            ...chunks,
            await SynchronizePlayerPosition({
                ...SPAWN_POSITION,
                yaw: client.yaw,
                pitch: client.pitch,
                flags: PlayerPositionFlag.NONE,
                teleportId: 0,
            }),
        ]
    })
    .register(ConfigurationServerBoundKeepAlive, async (args) => {})

    .register(PlayPong, async (args) => {})

    .register(ResourcePackResponse, async (args) => {})
