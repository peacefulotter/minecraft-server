import {
    AcknowledgeMessage,
    SetPlayerOnGround,
    SetPlayerPosition,
    SetPlayerPositionAndRotation,
    SetPlayerRotation,
} from '~/packets/server'
import { HandlerBuilder } from '.'

export const PlayHandler = new HandlerBuilder({})
    .addPacket(AcknowledgeMessage, async ({ packet }) => {
        console.log(packet)
    })
    .addPacket(SetPlayerPosition, async ({ client, packet }) => {
        client.position = packet
    })
    .addPacket(SetPlayerPositionAndRotation, async ({ client, packet }) => {
        const { yaw, pitch, ...position } = packet
        client.position = position
        client.rotation = { yaw, pitch }
    })
    .addPacket(SetPlayerRotation, async ({ client, packet }) => {
        const { onGround, ...rotation } = packet
        client.rotation = rotation
        if (client.position !== undefined) client.position.onGround = onGround
    })
    .addPacket(SetPlayerOnGround, async ({ client, packet }) => {
        if (client.position !== undefined)
            client.position.onGround = packet.onGround
    })
    .build('Play')
