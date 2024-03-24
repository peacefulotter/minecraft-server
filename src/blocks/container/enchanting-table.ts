import type { Vec3 } from 'vec3'

import { Container } from '.'
import type { Server } from '~/net/server'

export class EnchantingTable extends Container<'minecraft:enchantment'> {
    constructor(server: Server, pos: Vec3) {
        super(
            server,
            pos,
            'minecraft:enchanting_table',
            'minecraft:enchantment'
        )
    }
}
