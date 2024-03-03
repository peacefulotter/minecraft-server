import * as NBT from 'nbtify'

type Slot = {
    itemId: number
    itemCount: number
    nbt?: NBT.NBTData | undefined
}

type Range = Readonly<[number, number]>
type Ranges<K extends string = string> = {
    readonly [k in K]: Range
}
type Slots<K extends string = string> = { [k in K]: Slot[] }

type Section = {
    name: string
    range: Range
    content: (Slot | undefined)[]
}

export class Inventory<SectionNames extends string> {
    private inventory: Slots<SectionNames>

    constructor(private readonly ranges: Ranges<SectionNames>) {
        this.inventory = Object.fromEntries(
            Object.keys(ranges).map((k) => [k, [] as Slot[]])
        ) as Slots<SectionNames>
    }

    getSectionFromSlot(slot: number): Section | undefined {
        for (const [name, range] of Object.entries(this.ranges)) {
            const [min, max] = range as [number, number]
            if (slot >= min && slot <= max) {
                return {
                    name,
                    range: [min, max],
                    content: this.inventory[name as SectionNames],
                }
            }
        }
        return undefined
    }

    setItemFromSlot(slot: number, item: Slot | undefined) {
        const section = this.getSectionFromSlot(slot)
        if (section) {
            section.content[slot - section.range[0]] = item
        }
    }

    setItem(section: SectionNames, index: number, item: Slot) {
        this.inventory[section][index] = item
    }

    public [Bun.inspect.custom]() {
        return this.inventory
    }
}

export class PlayerInventory extends Inventory<
    keyof typeof PlayerInventory.ranges
> {
    static ranges = {
        crafting_output: [0, 0],
        crafting_input: [1, 4],
        armor: [5, 8],
        main: [9, 35],
        hotbar: [36, 44],
        offhand: [45, 45],
    } as const

    constructor() {
        super(PlayerInventory.ranges)
    }

    static sections = [] as const
}
