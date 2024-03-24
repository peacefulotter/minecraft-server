import type { Vec3 } from 'vec3'

import { Container } from '.'
import type { Server } from '~/net/server'

export class Chest extends Container<'minecraft:generic_9x3'> {
    constructor(server: Server, pos: Vec3) {
        super(server, pos, 'minecraft:chest', 'minecraft:generic_9x3')
    }
}
