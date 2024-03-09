import * as NBT from 'nbtify'
import type { Block } from '~/blocks/handler'
import { DB } from '~/db'

type Slot = {
    itemId: number
    itemCount: number
    nbt?: NBT.NBTData | undefined
}

type Range = Readonly<[number, number]>

export type Ranges = {
    readonly [k in string]: Range
}

type Slots<K extends string = string> = { [k in K]: (Slot | undefined)[] }

type Section = {
    name: string
    range: Range
    content: (Slot | undefined)[]
}

type Keys<R extends Ranges> = keyof R extends string ? keyof R : never

export class Inventory<R extends Ranges, S extends string = Keys<R>> {
    protected inventory: Slots<S>

    constructor(readonly ranges: R) {
        this.inventory = Object.fromEntries(
            Object.keys(ranges).map((k) => [k, [] as Slot[]])
        ) as Slots<S>
    }

    getSectionFromSlot(slot: number): Section | undefined {
        for (const [name, range] of Object.entries(this.ranges)) {
            const [min, max] = range as [number, number]
            if (slot >= min && slot <= max) {
                return {
                    name,
                    range: [min, max],
                    content: this.inventory[name as S],
                }
            }
        }
        return undefined
    }

    setItemFromSlot(slot: number, item: Slot | undefined) {
        const section = this.getSectionFromSlot(slot)
        if (section) {
            const { content, range } = section
            const idx = slot - range[0]
            if (idx < 0 || idx > range[1]) {
                throw new Error(
                    `Invalid slot index ${idx} for section ${section} with range ${range}`
                )
            }
            content[idx] = item
        }
    }

    setItem(section: S, index: number, item: Slot) {
        this.inventory[section][index] = item
    }

    itemToBlock(section: S, index: number) {
        const item = this.inventory[section][index]
        if (!item) return undefined

        const name =
            DB.item_id_to_name[
                item.itemId.toString() as keyof typeof DB.item_id_to_name
            ]
        const block = DB.blocks[name as keyof typeof DB.blocks] as Block
        return { name, block }
    }

    public [Bun.inspect.custom]() {
        return this.inventory
    }
}

export class PlayerInventory extends Inventory<typeof PlayerInventory.ranges> {
    static ranges = {
        crafting_output: [0, 0],
        crafting_input: [1, 4],
        armor: [5, 8],
        main: [9, 35],
        hotbar: [36, 44],
        offhand: [45, 45],
    } as const

    heldSlotIdx: number = 0

    constructor() {
        super(PlayerInventory.ranges)
    }

    getHeldItem() {
        return this.heldSlotIdx < 0 ||
            this.heldSlotIdx >= this.inventory.hotbar.length
            ? undefined
            : this.inventory.hotbar[this.heldSlotIdx]
    }

    heldBlock() {
        return this.itemToBlock('hotbar', this.heldSlotIdx)
    }
}
