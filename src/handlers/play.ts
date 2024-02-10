import {
    AcknowledgeMessage,
    SetPlayerOnGround,
    SetPlayerPosition,
    SetPlayerPositionAndRotation,
    SetPlayerRotation,
} from '~/packets/server'
import { HandlerBuilder } from '.'
import {
    ChunkDataAndUpdateLight,
    PlayerPositionFlag,
    SetDefaultSpawnPosition,
    SynchronizePlayerPosition,
} from '~/packets/client'
import BitSet from 'bitset'

let state = -1

export const PlayHandler = new HandlerBuilder({})
    .addPacket(AcknowledgeMessage, async ({ packet }) => {
        console.log(packet)
    })
    .addPacket(SetPlayerPosition, async ({ client, packet }) => {
        client.position = packet
        state++
        if (state === 0) {
            return ChunkDataAndUpdateLight.create({
                chunkX: 0,
                chunkZ: 0,
                heightMaps: false,
                data: Buffer.from([0]),
                blockEntity: [
                    {
                        packedXZ: 0,
                        y: 0,
                        type: 1,
                        data: false,
                    },
                ],
                skyLightMask: new BitSet(0),
                blockLightMask: new BitSet(0),
                emptySkyLightMask: new BitSet(0),
                emptyBlockLightMask: new BitSet(0),
                skyLightArray: [],
                blockLightArray: [],
            })
        }
        if (state === 1) {
            return SynchronizePlayerPosition.create({
                x: 0,
                y: 100,
                z: 0,
                yaw: 0,
                pitch: 0,
                flags:
                    PlayerPositionFlag.X |
                    PlayerPositionFlag.Y |
                    PlayerPositionFlag.Z |
                    PlayerPositionFlag.Y_ROT |
                    PlayerPositionFlag.X_ROT,
                teleportId: 0,
            })
        }
        if (state === 2) {
            return SetDefaultSpawnPosition.create({
                location: { x: 0, y: 100, z: 0 },
                angle: 0,
            })
        }
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
