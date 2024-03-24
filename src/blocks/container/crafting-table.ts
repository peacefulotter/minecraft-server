import type { Vec3 } from 'vec3'

import { Container } from '.'

export class CraftingTable extends Container<'minecraft:crafting'> {
    constructor(pos: Vec3) {
        super(pos, 'minecraft:crafting_table', 'minecraft:crafting')
        this.addListener('crafting', () => {
            this.checkRecipe()
        })
    }

    checkRecipe() {
        const input = this.getItemsFromSection('crafting')
        console.log(input)
    }
}
