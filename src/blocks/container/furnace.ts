import type { Vec3 } from 'vec3'

import { Container } from '.'

export class Furnace extends Container<'minecraft:furnace'> {
    constructor(pos: Vec3) {
        super(pos, 'minecraft:furnace', 'minecraft:furnace')
    }
}
