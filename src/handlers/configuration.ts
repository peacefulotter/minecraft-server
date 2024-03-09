import * as NBT from 'nbtify'
import { DimensionResource } from 'region-types'
import {
    FinishConfiguration,
    PluginMessage,
    PlayPong,
    ResourcePackResponse,
    ConfigurationClientInformation,
    ConfigurationServerBoundKeepAlive,
} from '~/net/packets/server'
import { Handler } from '.'
import { Client, ClientState } from '~/net/client'
import {
    ChunkDataAndUpdateLight,
    FinishConfiguration as ClientFinishConfiguration,
    GameEvent,
    PlayLogin,
    PlayerInfoUpdate,
    PlayerPositionFlag,
    SetCenterChunk,
    SetContainerContent,
    SetDefaultSpawnPosition,
    SpawnEntity,
    SynchronizePlayerPosition,
} from '~/net/packets/client'
import { GameMode } from '~/data/enum'
import { hashSeed } from '~/seed'
import type { ClientBoundPacket } from '~/net/packets/create'
import BitSet from 'bitset'
import { chunk } from '~/world/chunk'
import { SPAWN_POSITION, WORLD_SEED } from '~/constants'
import { entities } from '~/data/entities'

export const ConfigurationHandler = Handler.init('Configuration')

    .register(ConfigurationClientInformation, async ({ client, packet }) => {
        client.clientInfo = packet
        return ClientFinishConfiguration.serialize({})
    })

    .register(PluginMessage, async (args) => {})

    .register(FinishConfiguration, async ({ server, client }) => {
        client.state = ClientState.PLAY

        const packets: any[] = [
            await PlayLogin.serialize({
                entityId: entities.player.typeId, // see data-types/entities.ts
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
                gameMode: GameMode.CREATIVE,
                previousGameMode: GameMode.UNDEFINED,
                isDebug: false,
                isFlat: false,
                death: undefined,
                portalCooldown: 0,
            }),
            await SetDefaultSpawnPosition.serialize({
                location: SPAWN_POSITION,
                angle: 0,
            }),
            await SetCenterChunk.serialize({ chunkX: 0, chunkZ: 0 }),
            await GameEvent.serialize({
                event: {
                    effect: 13, // TODO: define effects
                    value: 0,
                },
            }),
        ]

        const size = 3
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {
                packets.push(
                    await ChunkDataAndUpdateLight.serialize({
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

        packets.push(
            await SynchronizePlayerPosition.serialize({
                ...SPAWN_POSITION,
                yaw: client.yaw,
                pitch: client.pitch,
                flags: PlayerPositionFlag.NONE,
                teleportId: 0,
            })
        )

        // Add the player to list of entities since it has finished config, it will spawn soon
        server.entities.addPlayer(client)
        const players = server.entities.getPlayers()

        if (players.length > 0) {
            const playerInfoUpdate = await PlayerInfoUpdate(
                players.map((p) => ({
                    uuid: p.entityUUID,
                    playerActions: {
                        addPlayer: {
                            name: p.username || 'player',
                            properties: [],
                        },
                        signature: undefined,
                        gameMode: p.gameMode,
                        listed: true,
                        ping: (p as Client).ping,
                        displayName: new NBT.NBTData(
                            NBT.parse(
                                JSON.stringify({
                                    color: 'light_purple',
                                    text: p.username || 'player',
                                    bold: true,
                                })
                            ),
                            { rootName: null }
                        ),
                    },
                }))
            )
            packets.push(playerInfoUpdate)
        }

        packets.push(
            ...(await Promise.all(
                server.entities
                    .getAll()
                    .map((entity) => SpawnEntity.serialize(entity))
            ))
        )

        console.log(client.inventory.getAllItems())

        packets.push(
            await SetContainerContent.serialize({
                windowId: 0,
                stateId: 0,
                carriedItems: client.inventory.getAllItems(),
                carriedItem: undefined,
            })
        )

        return packets
    })
    .register(ConfigurationServerBoundKeepAlive, async (args) => {})

    .register(PlayPong, async (args) => {})

    .register(ResourcePackResponse, async (args) => {})
