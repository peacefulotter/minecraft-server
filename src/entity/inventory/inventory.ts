import * as NBT from 'nbtify'
import type { Block } from '~/blocks/handler'
import { DB } from '~/db'

type Slot = {
    itemId: number
    itemCount: number
    nbt: NBT.NBTData | undefined
}

export class Inventory {
    protected inventory = new Map<number, Slot>()

    constructor(private readonly length: number) {}

    getItem(slot: number) {
        console.log(this)
        console.log(this.inventory)
        return this.inventory.get(slot)
    }

    setItem(slot: number, item: Slot | undefined) {
        if (slot < 0 || slot >= this.length) {
            throw new Error(
                `Invalid slot index: ${slot}, length: ${this.length}`
            )
        }
        if (item) {
            this.inventory.set(slot, item)
        } else {
            this.inventory.delete(slot)
        }
    }

    itemToBlock(slot: number) {
        const item = this.getItem(slot)
        if (!item) return undefined

        const name =
            DB.item_id_to_name[
                item.itemId.toString() as keyof typeof DB.item_id_to_name
            ]
        const block = DB.blocks[
            name as keyof typeof DB.blocks
        ] as unknown as Block
        return { name, block }
    }

    getAllItems() {
        return new Array(this.length)
            .fill(0)
            .map((_, i) => this.inventory.get(i))
    }
}

export type InventorySections = { [name: string]: number }

export class MergedInventory<S extends InventorySections> extends Inventory {
    constructor(private readonly sections: S) {
        super(Object.values(sections).reduce((acc, len) => acc + len))
    }

    private getIndex(name: keyof S, slot: number) {
        let lengthUntilName = 0
        for (const [n, len] of Object.entries(this.sections)) {
            if (n === name) break
            lengthUntilName += len
        }
        return lengthUntilName + slot
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
}
