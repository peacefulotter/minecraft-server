import {
    AcknowledgeMessage,
    ChatCommand,
    ChatMessage,
    ConfirmTeleportation,
    PlayServerBoundKeepAlive,
    PlayerAction,
    PlayerCommand,
    SetPlayerOnGround,
    SetPlayerPosition,
    SetPlayerPositionAndRotation,
    SetPlayerRotation,
    SwingHand,
} from '~/net/packets/server'
import { Handler } from '.'
import {
    SetHeadRotation,
    SpawnEntity,
    UpdateEntityPosition,
    UpdateEntityPositionAndRotation,
    UpdateEntityRotation,
} from '~/net/packets/client'
import { deltaPosition } from '~/position'

export const PlayHandler = Handler.init('Play')

    .register(ConfirmTeleportation, async ({ server, client }) => {
        server.broadcast(client, await SpawnEntity(client))
    })

    .register(AcknowledgeMessage, async ({ packet }) => {})

    .register(ChatCommand, async (args) => {
        await args.server.cmd.handle(args)
    })

    .register(ChatMessage, async ({ client, packet }) => {
        console.log(packet)
    })

    .register(PlayServerBoundKeepAlive, async ({ client, packet }) => {
        client.keepAlive(packet.id)
    })

    .register(SetPlayerPosition, async ({ server, client, packet }) => {
        const newPosition = packet

        const delta = deltaPosition(client.position, newPosition)
        client.position = newPosition

        server.broadcast(
            client,
            await UpdateEntityPosition({
                entityId: client.entityId,
                ...delta,
                onGround: client.position.onGround,
            })
        )
    })

    .register(
        SetPlayerPositionAndRotation,
        async ({ server, client, packet }) => {
            const { yaw, pitch, ...newPosition } = packet

            const delta = deltaPosition(client.position, newPosition)

            client.position = newPosition
            client.rotation = { yaw, pitch }

            server.broadcast(client, [
                await UpdateEntityPositionAndRotation({
                    entityId: client.entityId,
                    ...delta,
                    yaw: client.yaw,
                    pitch: client.pitch,
                    onGround: client.position.onGround,
                }),
                await SetHeadRotation({
                    entityId: client.entityId,
                    headYaw: client.yaw, // TODO: headYaw
                }),
            ])
        }
    )

    .register(SetPlayerRotation, async ({ server, client, packet }) => {
        const { onGround, ...rotation } = packet
        client.rotation = rotation
        if (client.position !== undefined) client.position.onGround = onGround

        server.broadcast(client, [
            await UpdateEntityRotation({
                entityId: client.entityId,
                yaw: rotation.yaw,
                pitch: rotation.pitch,
                onGround: onGround,
            }),
            await SetHeadRotation({
                entityId: client.entityId,
                headYaw: client.yaw, // TODO: headYaw
            }),
        ])
    })

    .register(SetPlayerOnGround, async ({ client, packet }) => {
        if (client.position !== undefined)
            client.position.onGround = packet.onGround
    })

    .register(PlayerCommand, async ({ client, packet }) => {
        // TODO: handle player commands
    })

    .register(PlayerAction, async ({ client, packet }) => {
        // TODO: handle player actions
    })

    .register(SwingHand, async ({ client, packet }) => {
        // TODO: handle swing hand
    })
