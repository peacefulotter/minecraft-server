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
import BitSet from 'bitset'
import { WORLD_SEED } from '~/constants'
import { entities } from '~/data/entities'
import { DataBitSet } from '~/data/types'

export const ConfigurationHandler = Handler.init('Configuration')

    .register(ConfigurationClientInformation, async ({ client, packet }) => {
        client.clientInfo = packet
        return ClientFinishConfiguration.serialize({})
    })

    .register(PluginMessage, async (args) => {})

    .register(FinishConfiguration, async ({ server, client }) => {
        client.state = ClientState.PLAY

        await client.write([
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
                location: client.position,
                angle: 0,
            }),
            await SetCenterChunk.serialize({ chunkX: 0, chunkZ: 0 }),
            await GameEvent.serialize({
                event: {
                    effect: 13, // TODO: define effects
                    value: 0,
                },
            }),
        ])

        const size = 3
        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                const chunk = server.world.getChunk(x, z)
                const { skyLightMask, emptySkyLightMask, skyLights } =
                    server.world.getLights(x, z)
                console.log('chunk', chunk.length)
                console.log('lights', skyLightMask, emptySkyLightMask)

                await client.write(
                    await ChunkDataAndUpdateLight.serialize({
                        chunkX: x,
                        chunkZ: z,
                        heightMaps: new NBT.NBTData({}, { rootName: null }),
                        data: chunk,
                        blockEntity: [],
                        skyLightMask: skyLightMask,
                        blockLightMask: new BitSet(0),
                        emptySkyLightMask: emptySkyLightMask,
                        emptyBlockLightMask: new BitSet(0),
                        skyLightArray: skyLights,
                        blockLightArray: [],
                    })
                )
            }
        }

        const packets = []

        packets.push(
            await SynchronizePlayerPosition.serialize({
                ...client.position,
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
