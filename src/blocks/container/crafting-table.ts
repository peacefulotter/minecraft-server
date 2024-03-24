import type { Vec3 } from 'vec3'

import { Container } from '.'
import type { InventoryItem } from '~/inventory/inventory'
import { DB } from '~/db'
import type { ShapedRecipe } from '~/data/recipe'
import type { Client } from '~/net/client'
import type { Server } from '~/net/server'

type CraftingGrid = (number | undefined)[][]

export class CraftingTable extends Container<'minecraft:crafting'> {
    constructor(server: Server, pos: Vec3, private client: Client) {
        super(server, pos, 'minecraft:crafting_table', 'minecraft:crafting')
        this.addListener('crafting', () => {
            // this.checkInputMatchesRecipe()
        })
    }

    toCraftingGrid(arr: (InventoryItem | undefined)[]): CraftingGrid {
        const ids = arr.map((item) => (item ? item.itemId : undefined))
        const grid: CraftingGrid = []
        for (let row = 0; row < 3; row++) {
            const temp: (number | undefined)[] = []
            for (let col = 0; col < 3; col++) {
                temp.push(ids[row * 3 + col])
            }
            grid.push(temp)
        }
        return grid
    }

    simplifyGrid(grid: CraftingGrid) {
        const emptyRows = [true, true, true]
        const emptyCols = [true, true, true]
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (grid[row][col] !== undefined) {
                    emptyRows[row] = false
                    emptyCols[col] = false
                }
            }
        }

        // Remove empty rows and columns from the grid only if
        // 1. There are empty and at the edges
        // 2. At the center and surrounded by at least one empty row/col
        const canBeRemoved = (empties: boolean[], i: number) =>
            (i === 0 && empties[0]) ||
            (i === 1 && empties[1] && (empties[0] || empties[2])) ||
            (i === 2 && empties[2])

        const simplified: (number | undefined)[][] = []
        for (let row = 0; row < 3; row++) {
            const temp: (number | undefined)[] = []
            if (canBeRemoved(emptyRows, row)) continue
            for (let col = 0; col < 3; col++) {
                if (canBeRemoved(emptyCols, col)) continue
                temp.push(grid[row][col])
            }
            simplified.push(temp)
        }

        return simplified
    }

    checkRecipe(grid: CraftingGrid, recipe: ShapedRecipe) {
        const { pattern, ingredients } = recipe
        if (pattern.length !== grid.length) return

        for (let row = 0; row < grid.length; row++) {
            if (row >= pattern.length) {
                return false
            }

            for (let col = 0; col < grid[row].length; col++) {
                const item = grid[row][col]
                const char = pattern[row].at(col)

                if (
                    char === undefined ||
                    (item === undefined && char !== ' ') ||
                    (item !== undefined && char === ' ')
                ) {
                    return false
                } else if (item === undefined && char === ' ') {
                    continue
                } else {
                    console.log(grid, pattern, ingredients, char)
                    const ingredient =
                        ingredients[char as keyof typeof ingredients]
                    if (!ingredient.includes(item as number)) {
                        return false
                    }
                }
            }
        }
        return true
    }

    checkRecipes(grid: CraftingGrid) {
        const recipes = DB.recipes['minecraft:crafting_shaped']

        for (const recipe of recipes) {
            if (this.checkRecipe(grid, recipe)) {
                console.log('Recipe found:', recipe)
                this.setItemFrom('output', 0, {
                    itemId: recipe.output.id,
                    itemCount: recipe.output.count,
                    nbt: undefined,
                })
                console.log(this)
                return
            }
        }
    }

    checkInputMatchesRecipe() {
        const input = this.getItemsFromSection('crafting')
        let grid = this.toCraftingGrid(input)
        grid = this.simplifyGrid(grid)
        console.log('====== GRID', grid)
        this.checkRecipes(grid)
    }
}
