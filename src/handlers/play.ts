import {
    AcknowledgeMessage,
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

export const PlayHandler = Handler.init('Play')

    .register(ConfirmTeleportation, async ({ packet }) => {
        console.log(packet)
    })

    .register(AcknowledgeMessage, async ({ packet }) => {
        console.log(packet)
    })

    .register(PlayServerBoundKeepAlive, async ({ client, packet }) => {
        client.keepAlive(packet.id)
    })

    .register(SetPlayerPosition, async ({ client, packet }) => {
        client.position = packet
    })

    .register(PlayerCommand, async ({ client, packet }) => {
        // TODO: handle player commands
    })

    .register(PlayerAction, async ({ client, packet }) => {
        // TODO: handle player actions
    })

    .register(SetPlayerPositionAndRotation, async ({ client, packet }) => {
        const { yaw, pitch, ...position } = packet
        client.position = position
        client.rotation = { yaw, pitch }
    })

    .register(SetPlayerRotation, async ({ client, packet }) => {
        const { onGround, ...rotation } = packet
        client.rotation = rotation
        if (client.position !== undefined) client.position.onGround = onGround
    })

    .register(SetPlayerOnGround, async ({ client, packet }) => {
        if (client.position !== undefined)
            client.position.onGround = packet.onGround
    })

    .register(SwingHand, async ({ client, packet }) => {
        // TODO: handle swing hand
    })
