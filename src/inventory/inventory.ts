import * as NBT from 'nbtify'
import type { Block } from '~/blocks/handler'
import { DB } from '~/db'

export type InventoryItem = {
    itemId: number
    itemCount: number
    nbt: NBT.NBTData | undefined
}

export class Inventory {
    // TODO: prod -> private
    inv = new Map<number, InventoryItem>()

    constructor(protected readonly length: number) {}

    getItem(slot: number) {
        return this.inv.get(slot)
    }

    setItem(slot: number, item: InventoryItem | undefined) {
        if (slot < 0 || slot >= this.length) {
            console.error(`Invalid slot index: ${slot}, length: ${this.length}`)
            return false
        }
        if (item) {
            this.inv.set(slot, item)
            return true
        } else {
            return this.inv.delete(slot)
        }
    }

    itemToBlock(slot: number) {
        const item = this.getItem(slot)
        if (!item) return undefined

        const name = DB.item_id_to_name[
            item.itemId.toString() as keyof typeof DB.item_id_to_name
        ] as string
        const block = DB.blocks[
            name as keyof typeof DB.blocks
        ] as unknown as Block
        return { name, block }
    }

    getAllItems() {
        return new Array(this.length).fill(0).map((_, i) => this.inv.get(i))
    }
}

type Listener<S extends InventorySections> = (
    item: InventoryItem | undefined,
    slot: number,
    name: keyof S
) => void

export interface InventorySections {
    [name: string]: number
}

export class MergedInventory<S extends InventorySections> extends Inventory {
    listeners = new Map<keyof S, Listener<S>[]>()
    slotToSection = new Map<number, keyof S>()

    constructor(private readonly sections: S) {
        super(Object.values(sections).reduce((acc, len) => acc + len))

        let offset = 0
        for (const [name, len] of Object.entries(sections)) {
            for (let i = 0; i < len; i++) {
                this.slotToSection.set(offset + i, name as keyof S)
            }
            offset += len
        }
    }

    addListener(name: keyof S, listener: Listener<S>) {
        if (!this.listeners.has(name)) {
            this.listeners.set(name, [])
        }
        this.listeners.get(name)?.push(listener)
    }

    getSectionOffset(name: keyof S) {
        let offset = 0
        for (const [n, len] of Object.entries(this.sections)) {
            if (n === name) break
            offset += len
        }
        return offset
    }

    private getIndex(name: keyof S, slot: number) {
        const offset = this.getSectionOffset(name)
        return offset + slot
    }

    from<T>(cb: (idx: number) => T, name: keyof S, slot: number) {
        if (slot < 0 || slot >= this.sections[name]) {
            return undefined
        }
        const idx = this.getIndex(name, slot)
        return cb.bind(this)(idx)
    }

    // Override setItem to call listeners in setItemWithName
    setItem(slot: number, item: InventoryItem | undefined) {
        if (slot < 0 || slot >= this.length) {
            console.error(`Invalid slot index: ${slot}, length: ${this.length}`)
            return false
        }
        const name = this.slotToSection.get(slot) as keyof S
        return this.setItemWithName(slot, name, item)
    }

    // Inner setItem method that also triggers listeners
    private setItemWithName(
        idx: number,
        name: keyof S,
        item: InventoryItem | undefined
    ) {
        const changed = super.setItem(idx, item)
        if (changed) {
            this.listeners
                .get(name)
                ?.forEach((listener) => listener(item, idx, name))
        }
        return changed
    }

    // slot = relative index
    getItemFrom(name: keyof S, slot: number) {
        return this.from(this.getItem, name, slot)
    }

    setItemFrom(name: keyof S, slot: number, item: InventoryItem | undefined) {
        this.from((i) => this.setItemWithName(i, name, item), name, slot)
    }

    itemToBlockFrom(name: keyof S, slot: number) {
        return this.from(this.itemToBlock, name, slot)
    }

    /**
     * Inventory implementation is very straightforward which allows for easy read write when you know the slot index
     * However, the drawback from this is when you want to get all slots from a section
     * In this scenario, you first need to calculate the offset and then get the slots iteratively
     */
    getItemsFromSection(name: keyof S) {
        const offset = this.getSectionOffset(name)
        return new Array(this.sections[name]).fill(0).map((_, i) => {
            return this.getItem(i + offset)
        })
    }

    setItemsFromSection(name: keyof S, items: (InventoryItem | undefined)[]) {
        const offset = this.getSectionOffset(name)
        items.forEach((item, i) => {
            this.setItemWithName(i + offset, name, item)
        })
    }
}
