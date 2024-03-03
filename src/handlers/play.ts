import * as NBT from 'nbtify'
import {
    AcknowledgeMessage,
    ChatCommand,
    ChatMessage,
    CloseContainer as ServerCloseContainer,
    ConfirmTeleportation,
    Interact,
    PlayServerBoundKeepAlive,
    PlayerAction,
    PlayerCommand,
    SetHeldItem,
    SetPlayerOnGround,
    SetPlayerPosition,
    SetPlayerPositionAndRotation,
    SetPlayerRotation,
    SwingHand,
    SetCreativeModeSlot,
    PlayerAbilities,
    TeleportToEntity,
    UseItemOn,
    UseItem,
} from '~/net/packets/server'
import { Handler } from '.'
import {
    BlockUpdate,
    CloseContainer as ClientCloseContainer,
    PlayerInfoUpdate,
    SetHeadRotation,
    SpawnEntity,
    UpdateEntityPosition,
    UpdateEntityPositionAndRotation,
    UpdateEntityRotation,
} from '~/net/packets/client'
import { deltaPosition } from '~/position'
import v from 'vec3'
import type { Client } from '~/net/client'
import { DataPosition } from '~/data/types'

export const PlayHandler = Handler.init('Play')

    .register(ConfirmTeleportation, async ({ server, client }) => {
        client.spawned = true

        const spawnEntity = await SpawnEntity.serialize(client)

        const players = server.entities.getPlayers()
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

        await server.broadcast(client, [playerInfoUpdate, spawnEntity])
    })

    .register(AcknowledgeMessage, async ({ packet }) => {
        console.log('TODO: ACKNOWLEDGE MESSAGE')
    })

    .register(ChatCommand, async (args) => {
        await args.server.cmd.handle(args)
    })

    .register(ChatMessage, async ({ client, packet }) => {
        console.log('TODO: CHAT MESSAGE')
    })

    .register(ServerCloseContainer, async ({ server, client, packet }) => {
        const res = await ClientCloseContainer.serialize({
            windowId: packet.windowId,
        })
        await server.broadcast(client, res)
    })

    .register(Interact, async ({ client, packet }) => {
        console.log('TODO: INTERACT')
    })

    .register(PlayServerBoundKeepAlive, async ({ client, packet }) => {
        client.keepAlive(packet.id)
    })

    .register(SetPlayerPosition, async ({ server, client, packet }) => {
        const { x, y, z, onGround } = packet

        const newPosition = v(x, y, z)
        const delta = deltaPosition(client.position, newPosition)

        client.position = newPosition
        client.onGround = onGround

        await server.broadcast(
            client,
            await UpdateEntityPosition.serialize({
                entityId: client.entityId,
                ...delta,
                onGround: client.onGround,
            })
        )
    })

    .register(
        SetPlayerPositionAndRotation,
        async ({ server, client, packet }) => {
            const { yaw, pitch, x, y, z, onGround } = packet

            const newPosition = v(x, y, z)
            const delta = deltaPosition(client.position, newPosition)

            client.position = newPosition
            client.rotation = { yaw, pitch }

            await server.broadcast(client, [
                await UpdateEntityPositionAndRotation.serialize({
                    entityId: client.entityId,
                    ...delta,
                    yaw: client.yaw,
                    pitch: client.pitch,
                    onGround: client.onGround,
                }),
                await SetHeadRotation.serialize({
                    entityId: client.entityId,
                    headYaw: client.headYaw,
                }),
            ])
        }
    )

    .register(SetPlayerRotation, async ({ server, client, packet }) => {
        const { onGround, ...rotation } = packet
        client.rotation = rotation
        if (client.position !== undefined) client.onGround = onGround

        await server.broadcast(client, [
            await UpdateEntityRotation.serialize({
                entityId: client.entityId,
                yaw: client.yaw,
                pitch: rotation.pitch,
                onGround: onGround,
            }),
            await SetHeadRotation.serialize({
                entityId: client.entityId,
                headYaw: client.headYaw,
            }),
        ])
    })

    .register(SetPlayerOnGround, async ({ client, packet }) => {
        if (client.position !== undefined) client.onGround = packet.onGround
    })

    .register(PlayerCommand, async ({ client, packet }) => {
        console.log('TODO: PLAYER COMMAND')
    })

    .register(PlayerAbilities, async ({ client, packet }) => {
        client.isFlying = packet.flags === 0x02
    })

    .register(PlayerAction, async ({ client, packet }) => {
        console.log('TODO: PLAYER ACTION')
    })

    .register(SetHeldItem, async ({ client, packet }) => {
        client.inventory.heldSlotIdx = packet.slot
    })

    .register(SetCreativeModeSlot, async ({ client, packet }) => {
        const { slot, item } = packet
        client.inventory.setItemFromSlot(slot, item)
        console.log(client.inventory)
    })

    .register(SwingHand, async ({ client, packet }) => {
        // TODO: handle swing hand
        console.log('TODO: SWINGING HAND')
    })

    .register(TeleportToEntity, async ({ client, packet }) => {
        console.log('TODO: TELEPORT TO ENTITY')
    })

    .register(UseItemOn, async ({ client, packet }) => {
        console.log('TODO: USE ITEM ON')
        // if ok: AcknowledgeBlockChange

        const slot = client.inventory.getHeldItem()

        console.log(slot)

        if (!slot) return

        return await BlockUpdate.serialize({
            location: packet.location,
            blockId: slot.itemId,
        })
    })

    .register(UseItem, async ({ client, packet }) => {
        console.log('TODO: USE ITEM')
        // if ok: AcknowledgeBlockChange
    })
