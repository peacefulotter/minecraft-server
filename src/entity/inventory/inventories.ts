import { MergedInventory, type InventorySections } from './inventory'

const createInventory =
    <T extends InventorySections>(sections: T) =>
    () =>
        new MergedInventory(sections)

export const inventories = {
    'minecraft:crafter_3x3': createInventory({
        output: 1,
        crafting: 9,
        player: 36,
    } as const),
    'minecraft:enchantment': createInventory({
        item: 1,
        lapis: 1,
        player: 36,
    } as const),
} as const

export type SupportedInventories = keyof typeof inventories
