import type { Vec3 } from 'vec3'

import { Container } from '.'
import type { Server } from '~/net/server'

export class BlastFurnace extends Container<'minecraft:blast_furnace'> {
    constructor(server: Server, pos: Vec3) {
        super(server, pos, 'minecraft:blast_furnace', 'minecraft:blast_furnace')
    }
}
