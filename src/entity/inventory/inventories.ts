import { Inventory, type Ranges } from './inventory'

const createInventory =
    <R extends Ranges>(ranges: R) =>
    () =>
        new Inventory(ranges)

export const inventories = {
    'minecraft:crafter_3x3': createInventory({
        output: [0, 0],
        crafting: [1, 9],
        main: [10, 36],
        hotbar: [37, 45],
    } as const),
    'minecraft:enchantment': createInventory({
        item: [0, 0],
        lapis: [1, 1],
        main: [2, 28],
        hotbar: [29, 37],
    } as const),
} as const

export type SupportedInventories = keyof typeof inventories
