const PLAYER_INV_SIZE = 36 as const

const withPlayer = <T>(sections: T) =>
    ({
        ...sections,
        player: PLAYER_INV_SIZE,
    } as const)

export const CONTAINER_INVENTORIES = {
    'minecraft:crafter_3x3': withPlayer({
        output: 1,
        crafting: 9,
    } as const),
    'minecraft:enchantment': withPlayer({
        item: 1,
        lapis: 1,
    } as const),
} as const

export type SupportedInventories = keyof typeof CONTAINER_INVENTORIES
