import type { Vec3 } from 'vec3'

import { Container } from '.'

export class BlastFurnace extends Container<'minecraft:blast_furnace'> {
    constructor(pos: Vec3) {
        super(pos, 'minecraft:blast_furnace', 'minecraft:blast_furnace')
    }
}
