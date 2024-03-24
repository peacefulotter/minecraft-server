import { readdir } from 'node:fs/promises'
import path from 'path'
import registries from './registries.json'
import blocks from './blocks.json'
import type {
    ItemName,
    MCJSONRecipe,
    MCJSONShapedRecipe,
    MCRecipeType,
} from './recipe'
import { getItemNamesFromTag } from './tags'
import type { Recipes } from '~/data/recipe'

const folder = path.join(import.meta.dir, '..', 'src', 'db')

const groupById = (data: any) =>
    Object.entries(data).reduce((acc, [key, value]: [any, any]) => {
        acc[value['protocol_id']] = key
        return acc
    }, {} as Record<string, string>)

const write = (filename: string, data: any, asConst: boolean = true) => {
    const file = path.join(folder, `${filename}.ts`)
    console.log('Writing:', file)
    const content = `export const ${filename} = ${JSON.stringify(
        data,
        null,
        2
    )}${asConst ? ' as const' : ''}`
    Bun.write(file, content)
}

console.log(Object.keys(registries))

//  ============ ITEMS ID -> NAME ============
const itemEntries = registries['minecraft:item']['entries']
write('item_id_to_name', groupById(itemEntries))

//  ========== BLOCKS ID -> NAME ===========
const blockEntries = registries['minecraft:block']['entries']
write('block_id_to_name', groupById(blockEntries))

// ============ BLOCK NAME -> BLOCK DATA ============
write('blocks', blocks)

//  ========== BLOCKS NAME -> DEFAULT STATE ID ===========
write(
    'block_name_to_default_state_id',
    Object.entries(blocks).reduce((acc, [key, value]: [any, any]) => {
        acc[key] = value.states.find((s: any) => s.default).id
        return acc
    }, {} as Record<string, string>)
)

// ============ BLOCK NAME -> MENU ID ============
const menuEntries = registries['minecraft:menu']['entries']
const blockNameToMenu = Object.entries(menuEntries).reduce(
    (acc, [blockName, menu]) => {
        acc[blockName] = menu.protocol_id
        return acc
    },
    {} as Record<string, number>
)
write('block_name_to_menu', blockNameToMenu)

// ============ RECIPES BUILDER ============

const recipes: Recipes = {
    'minecraft:crafting_shaped': [],
    'minecraft:crafting_shapeless': [],
}

const getItemNames = (
    item: { item?: ItemName; tag?: string } | { item: ItemName }[]
) => {
    if (Array.isArray(item)) {
        return item.map((i) => i.item)
    } else if ('item' in item) {
        return [item.item]
    } else if ('tag' in item) {
        return getItemNamesFromTag(item.tag) as ItemName[]
    }
    console.error('Case not taken into account', item)
    return undefined
}

const handleShapedRecipe = ({
    type,
    pattern,
    key,
    result,
}: MCJSONShapedRecipe) => {
    const ingredients: { [char: string]: number[] } = {}

    const chars = pattern.map((row) => row.split('')).flat()

    for (const char of chars) {
        if (char === ' ') continue

        const item = key[char as keyof typeof key]
        const itemNames = getItemNames(item) as ItemName[]
        const itemIds = itemNames.map(
            (itemName) => itemEntries[itemName].protocol_id
        )
        ingredients[char] = itemIds
    }

    const outputItemName = typeof result === 'object' ? result.item : result
    const outputCount = typeof result === 'object' ? result.count ?? 1 : 1
    const output = {
        id: itemEntries[outputItemName].protocol_id,
        count: outputCount,
    }

    recipes[type].push({
        pattern,
        ingredients,
        output,
    })
}

// Read directory recipes and load all json files
const recipesDir = path.join(import.meta.dir, 'recipes')
const files = await readdir(recipesDir)

for (const p of files) {
    const file = Bun.file(path.join(recipesDir, p))
    const recipe = (await file.json()) as MCJSONRecipe
    if (recipe.type === 'minecraft:crafting_shaped') {
        handleShapedRecipe(recipe)
    } else if (recipe.type === 'minecraft:crafting_shapeless') {
        console.log('Shapeless recipe:', recipe)
    }
}

write('recipes', recipes, false)
