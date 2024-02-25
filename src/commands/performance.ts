import { SpawnEntity } from '~/net/packets/client'
import type { CmdArgs, Command } from './handler'
import { ArmorStand } from '~/entity/armor-stand'

export const performance: Command<[]> = {
    name: 'perf',
    description: 'Performs performance tests',
    callback: async ({ client }: CmdArgs) => {
        const length = 20
        const r = 4
        const stands = new Array(length).fill(0).map((_, i) => {
            const as = new ArmorStand()
            as.position.x = Math.cos((i / length) * 2 * Math.PI) * r
            as.position.z = Math.sin((i / length) * 2 * Math.PI) * r
            console.log(as.position)
            return as
        })

        // console.log(stands)

        await client.write(
            await Promise.all(
                stands.map(async (as, i) => {
                    console.log('======', i, as.position)
                    return await SpawnEntity({
                        entityId: as.entityId,
                        entityUUID: as.entityUUID,
                        type: as.info.typeId,
                        x: as.position.x,
                        y: as.position.y,
                        z: as.position.z,
                        yaw: as.rotation.yaw,
                        pitch: as.rotation.pitch,
                        headYaw: as.headYaw,
                        data: as.data,
                        velocityX: as.velocity.x,
                        velocityY: as.velocity.y,
                        velocityZ: as.velocity.z,
                    })
                })
            )
        )

        // let i = 0
        // setInterval(async () => {
        //     await armorStand.setMetadata(client, {
        //         17: { x: i, y: i, z: i },
        //         18: { x: -i, y: i, z: i },
        //         19: { x: i, y: -i, z: i },
        //         20: { x: i, y: i, z: -i },
        //         21: { x: -i, y: -i, z: i },
        //     })
        //     i += 0.1
        // }, 1)
    },
    parser: [],
}
