import { SpawnEntity } from '~/net/packets/client'
import type { CmdArgs, Command } from './handler'
import { generateV4 } from '@minecraft-js/uuid'

export const ntt: Command<[]> = {
    name: 'ntt',
    description: 'Spawn all possible entity types in the world.',
    callback: async ({ client }: CmdArgs) => {
        const packets = []
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 11; j++) {
                packets.push(
                    await SpawnEntity({
                        entityId: i * 10 + j,
                        entityUUID: generateV4(),
                        type: (i * 10 + j) as any,
                        x: i * 4,
                        y: 2,
                        z: j * 4,
                        yaw: 0,
                        pitch: 0,
                        headYaw: 0,
                        data: 0,
                        velocityX: 0,
                        velocityY: 0,
                        velocityZ: 0,
                    })
                )
            }
        }
        await client.write(packets)
    },
    parser: [],
}
