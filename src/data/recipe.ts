export type ShapedRecipe = {
    pattern: string[]
    ingredients: Record<string, number[]>
    output: { id: number; count: number }
}

export type ShapelessRecipe = {}

export type Recipes = {
    'minecraft:crafting_shapeless': ShapedRecipe[]
    'minecraft:crafting_shaped': ShapelessRecipe[]
}

export type Recipe = ShapedRecipe | ShapelessRecipe
