import * as NBT from 'nbtify'
import type { Block } from '~/blocks/handler'
import { DB } from '~/db'

type Slot = {
    itemId: number
    itemCount: number
    nbt: NBT.NBTData | undefined
}

export class Inventory {
    // TODO: prod -> private
    inv = new Map<number, Slot>()

    constructor(protected readonly length: number) {}

    getItem(slot: number) {
        return this.inv.get(slot)
    }

    setItem(slot: number, item: Slot | undefined) {
        if (slot < 0 || slot >= this.length) {
            throw new Error(
                `Invalid slot index: ${slot}, length: ${this.length}`
            )
        }
        if (item) {
            this.inv.set(slot, item)
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

export type InventorySections = { [name: string]: number }

export class MergedInventory<S extends InventorySections> extends Inventory {
    constructor(private readonly sections: S) {
        super(Object.values(sections).reduce((acc, len) => acc + len))
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

    // slot = relative index
    getItemFrom(name: keyof S, slot: number) {
        return this.from(this.getItem, name, slot)
    }

    setItemFrom(name: keyof S, slot: number, item: Slot | undefined) {
        this.from((i) => this.setItem(i, item), name, slot)
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

    setItemsFromSection(name: keyof S, items: (Slot | undefined)[]) {
        const offset = this.getSectionOffset(name)
        items.forEach((item, i) => {
            this.setItem(i + offset, item)
        })
    }
}
