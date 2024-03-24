import type { Vec3 } from 'vec3'

import { Container } from '.'

export class EnchantingTable extends Container<'minecraft:enchantment'> {
    constructor(pos: Vec3) {
        super(pos, 'minecraft:enchanting_table', 'minecraft:enchantment')
    }
}
