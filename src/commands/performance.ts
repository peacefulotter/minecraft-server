import { SpawnEntity } from '~/net/packets/client'
import type { CmdArgs, Command } from './handler'
import { ArmorStand } from '~/entity/entities'
import v from 'vec3'

export const perf: Command<[]> = {
    name: 'perf',
    description: 'Performs performance tests',
    callback: async ({ client }: CmdArgs) => {
        const length = 150
        const r = 5
        const stands = new Array(length).fill(0).map((_, i) => {
            const as = new ArmorStand()
            as.position.x = Math.cos((i / length) * 2 * Math.PI) * r
            as.position.z = Math.sin((i / length) * 2 * Math.PI) * r
            return as
        })

        await client.write(
            await Promise.all(
                stands.map(async (as, i) => {
                    return await SpawnEntity.serialize({
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

        let i = 0
        let date = performance.now()

        const iterations = 2500
        let intervalTime = 0
        let packetWriteTime = 0
        const interval = setInterval(async () => {
            if (i > iterations) {
                console.log('===============================')
                console.log('======== REACHED END ==========')
                console.log('===============================')
                console.log('Interval time:', intervalTime / iterations, 'ms')
                console.log('Packet time:', packetWriteTime / iterations, 'ms')
                clearInterval(interval)
                return
            }

            intervalTime += performance.now() - date

            date = performance.now()
            await client.write(
                await Promise.all(
                    stands.map(async (as, j) => {
                        const k = i + 0.1 * j
                        return await as.setMetadata({
                            17: v(k, k, k),
                            18: v(k, k, k),
                            19: v(k, k, k),
                            20: v(k, k, k),
                            21: v(k, k, k),
                        })
                    })
                ),
                false
            )

            packetWriteTime += performance.now() - date
            date = performance.now()

            i += 1
        }, 1)
    },
    parser: [],
}
