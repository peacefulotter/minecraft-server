import type { BlockMenuName } from '~/db/block_name_to_menu'
import type { InventorySections } from './inventory'

export const PLAYER_INV_SIZE = 36 as const

const BI_ITEMS_MAP_SECTIONS = {
    first_item: 1,
    second_item: 1,
    result: 1,
} as const

const GENERIC_SECTIONS = <T extends number>(t: T) => ({
    content: t,
})

export const CONTAINER_INVENTORIES = {
    'minecraft:anvil': {
        ...BI_ITEMS_MAP_SECTIONS,
    },
    'minecraft:beacon': {
        payment_item: 1,
    },
    'minecraft:blast_furnace': {
        ingredient: 1,
        fuel: 1,
        output: 1,
    },
    'minecraft:brewing_stand': {
        bottles: 3,
        potion_ingredient: 1,
        blaze_powder: 1,
    },
    'minecraft:cartography_table': {
        ...BI_ITEMS_MAP_SECTIONS,
    },
    'minecraft:crafter_3x3': {
        ...GENERIC_SECTIONS(9),
    },
    'minecraft:crafting': {
        output: 1,
        crafting: 9,
    },
    'minecraft:enchantment': {
        item: 1,
        lapis: 1,
    },
    'minecraft:furnace': {
        ingredient: 1,
        fuel: 1,
        output: 1,
    },
    'minecraft:generic_3x3': {
        ...GENERIC_SECTIONS(9),
    },
    'minecraft:generic_9x1': {
        ...GENERIC_SECTIONS(9),
    },
    'minecraft:generic_9x2': {
        ...GENERIC_SECTIONS(18),
    },
    'minecraft:generic_9x3': {
        ...GENERIC_SECTIONS(27),
    },
    'minecraft:generic_9x4': {
        ...GENERIC_SECTIONS(36),
    },
    'minecraft:generic_9x5': {
        ...GENERIC_SECTIONS(45),
    },
    'minecraft:generic_9x6': {
        ...GENERIC_SECTIONS(54),
    },
    'minecraft:grindstone': {
        ...BI_ITEMS_MAP_SECTIONS,
    },
    'minecraft:hopper': {
        ...GENERIC_SECTIONS(5),
    },
    'minecraft:lectern': {
        book: 0,
    },
    'minecraft:loom': {
        banner: 1,
        dye: 1,
        pattern: 1,
        output: 1,
    },
    'minecraft:merchant': {
        ...BI_ITEMS_MAP_SECTIONS,
    },
    'minecraft:shulker_box': {
        ...GENERIC_SECTIONS(27),
    },
    'minecraft:smithing': {
        template: 1,
        base_item: 1,
        additional_item: 1,
        output: 1,
    },
    'minecraft:smoker': {
        ingredient: 1,
        fuel: 1,
        output: 1,
    },
    'minecraft:stonecutter': {
        input: 1,
        result: 1,
    },
} as const satisfies Record<BlockMenuName, InventorySections>

export type ContainerInventories = typeof CONTAINER_INVENTORIES
