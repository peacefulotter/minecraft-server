import type { Vec3 } from 'vec3'

import { Container } from '.'

export class Chest extends Container {
    constructor(pos: Vec3) {
        super(pos, 'minecraft:chest', 'minecraft:generic_9x3')
    }
}
