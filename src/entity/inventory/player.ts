import { MergedInventory } from './inventory'

const sections = {
    crafting_output: 1,
    crafting_input: 4,
    armor: 4,
    main: 27,
    hotbar: 9,
    offhand: 1,
} as const

export class PlayerInventory extends MergedInventory<typeof sections> {
    heldSlotIdx: number = 0

    constructor() {
        super(sections)
    }

    getHeldItem() {
        return this.getItemFrom('hotbar', this.heldSlotIdx)
    }

    heldBlock() {
        return this.itemToBlockFrom('hotbar', this.heldSlotIdx)
    }
}
