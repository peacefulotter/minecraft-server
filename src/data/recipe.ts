import type { MCPrefixed } from './enum'

export type ShapedRecipe = {
    pattern: string[]
    ingredients: Record<string, number[]>
    output: { id: number; count: number }
}

export type ShapelessRecipe = {}

export type RecipeType = MCPrefixed<
    | 'crafting_shaped'
    | 'crafting_shapeless'
    | 'smelting'
    | 'stonecutting'
    | 'campfire_cooking'
    | 'blasting'
    | 'smoking'
    | 'smithing_trim'
    | 'smithing_transform'
>

export type Recipes = {
    'minecraft:crafting_shapeless': ShapedRecipe[]
    'minecraft:crafting_shaped': ShapelessRecipe[]
}

export type Recipe = ShapedRecipe | ShapelessRecipe
