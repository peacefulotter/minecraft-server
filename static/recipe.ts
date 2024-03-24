import registries from './registries.json'
import type { MCPrefixed } from '~/data/enum'

export type ItemName = keyof (typeof registries)['minecraft:item']['entries']

export type MCRecipeType = MCPrefixed<
    | 'crafting_shaped'
    | 'crafting_shapeless'
    | 'smelting'
    | 'stonecutting'
    | 'campfire_cooking'
    | 'blasting'
    | 'smoking'
    | 'smithing_trim'
    | 'smithing_transform'
    | 'crafting_special_suspiciousstew'
    | 'crafting_special_shielddecoration'
    | 'crafting_special_repairitem'
    | 'crafting_special_mapcloning'
    | 'crafting_special_mapextending'
    | 'crafting_special_firework_star'
    | 'crafting_special_firework_star_fade'
    | 'crafting_special_firework_rocket'
>

type MCJSONBaseRecipe<T extends MCRecipeType = MCRecipeType> = {
    type: T
}

type MCJSONRecipeResult = {
    result: ItemName | { item: ItemName; count?: number }
}

export type MCJSONShapedRecipe =
    MCJSONBaseRecipe<'minecraft:crafting_shaped'> & {
        key: {
            char: { item?: ItemName; tag?: ItemName } | { item: ItemName }[]
        }
        pattern: string[]
    } & MCJSONRecipeResult

export type MCJSONShapelessRecipe =
    MCJSONBaseRecipe<'minecraft:crafting_shapeless'> & {
        // Multiple ingredients can have the same effect (think planks, coal / charcoal, etc.)
        ingredients: ({ item: ItemName } | { item: ItemName }[])[]
    } & MCJSONRecipeResult

export type MCJSONSSmeltingRecipe = MCJSONBaseRecipe<'minecraft:smelting'> & {
    ingredient: { item: ItemName }
    cookingtime: number
    experience: number
} & MCJSONRecipeResult

export type MCJSONStonecuttingRecipe =
    MCJSONBaseRecipe<'minecraft:stonecutting'> & {
        count: number
        ingredient: { item: ItemName }
    } & MCJSONRecipeResult

export type MCJSONBlastingRecipe = Omit<MCJSONSSmeltingRecipe, 'type'> &
    MCJSONBaseRecipe<'minecraft:blasting'>

export type MCJSONSmithing = MCJSONBaseRecipe<'minecraft:smithing_trim'> & {
    addition: { tag: ItemName }
    base: { tag: ItemName }
    template: { item: ItemName }
}

export type MCJSONCampfireCooking =
    MCJSONBaseRecipe<'minecraft:campfire_cooking'> & {
        cookingtime: number
        experience: number
        ingredient: { item: ItemName }
    } & MCJSONRecipeResult

export type MCJSONSmoking = Omit<MCJSONCampfireCooking, 'type'> &
    MCJSONBaseRecipe<'minecraft:smoking'>

export type MCJSONRecipe =
    | MCJSONShapelessRecipe
    | MCJSONShapedRecipe
    | MCJSONSSmeltingRecipe
    | MCJSONBlastingRecipe
    | MCJSONStonecuttingRecipe
    | MCJSONSmithing
    | MCJSONCampfireCooking
    | MCJSONSmoking
