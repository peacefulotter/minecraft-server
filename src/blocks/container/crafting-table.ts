import type { Vec3 } from 'vec3'

import { Container } from '.'

export class CraftingTable extends Container {
    constructor(pos: Vec3) {
        super(pos, 'minecraft:crafting_table', 'minecraft:crafting')
    }
}
