import type { Vec3 } from 'vec3'

import { Container } from '.'
import type { Server } from '~/net/server'

export class Furnace extends Container<'minecraft:furnace'> {
    constructor(server: Server, pos: Vec3) {
        super(server, pos, 'minecraft:furnace', 'minecraft:furnace')
    }
}
