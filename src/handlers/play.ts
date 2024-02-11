import * as NBT from 'nbtify'
import {
    AcknowledgeMessage,
    ConfirmTeleportation,
    SetPlayerOnGround,
    SetPlayerPosition,
    SetPlayerPositionAndRotation,
    SetPlayerRotation,
} from '~/packets/server'
import {
    ChunkDataAndUpdateLight,
    PlayerPositionFlag,
    SetCenterChunk,
    SetDefaultSpawnPosition,
    SynchronizePlayerPosition,
} from '~/packets/client'
import BitSet from 'bitset'
import { terrainMap } from '~/world/parse'
import { DataNBT } from '~/data-types/registry'
import { DataBitSet } from '~/data-types/basic'
import type { ClientBoundPacket } from '~/packets/create'
import { Handler } from '.'

let state = -1

const block_state_id = 0x9

const chunk = [
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    16,
    0,
    0,
    block_state_id,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
]

export const PlayHandler = Handler.init('Play')

    .register(ConfirmTeleportation, async ({ packet }) => {
        console.log(packet)
    })

    .register(AcknowledgeMessage, async ({ packet }) => {
        console.log(packet)
    })

    .register(SetPlayerPosition, async ({ client, packet }) => {
        client.position = packet
        state++
        if (state === 0) {
            return SetCenterChunk({ chunkX: 0, chunkZ: 0 })
        }
        if (state === 1) {
            console.log(
                'EMPTY NBT',
                await DataNBT.write(new NBT.NBTData({}, { rootName: null }))
            )
            console.log('EMPTY Bitset', DataBitSet.write(new BitSet(0)))
            const packets: ClientBoundPacket[] = []
            const size = 3
            for (let i = -size; i <= size; i++) {
                for (let j = -size; j <= size; j++) {
                    packets.push(
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
            return packets
        }
        if (state === 3) {
            return SynchronizePlayerPosition({
                x: client.x,
                y: client.y,
                z: client.z,
                yaw: client.yaw,
                pitch: client.pitch,
                flags: PlayerPositionFlag.NONE,
                // PlayerPositionFlag.X |
                // PlayerPositionFlag.Y |
                // PlayerPositionFlag.Z |
                // PlayerPositionFlag.Y_ROT |
                // PlayerPositionFlag.X_ROT,
                teleportId: 0,
            })
        }
        if (state === 2) {
            return SetDefaultSpawnPosition({
                location: { x: 8.5, y: 0, z: 8.5 },
                angle: 0,
            })
        }
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
