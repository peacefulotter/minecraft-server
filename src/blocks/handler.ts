import type { Vec3 } from 'vec3'
import blocks from '~/db/blocks.json'
import blockNameToMenu from '~/db/block_name_to_menu.json'

type BlockName = typeof blocks

type BlockEntityMenuName = keyof typeof blockNameToMenu

abstract class BlockEntity {
    constructor(
        public pos: Vec3,
        public name: BlockName,
        public menuName: BlockEntityMenuName
    ) {}
}

class EnchantingTable extends BlockEntity {
    constructor(public pos: Vec3) {
        super(pos, 'minecraft:enchanting_table', 'minecraft:enchantment')
    }
}

const blockEntityBuilders = {
    'minecraft:enchanting_table': EnchantingTable,
} as const

type SupportedBlockEntity = keyof typeof blockEntityBuilders

type BlockProperties = {
    [key: string]: string[]
}

type BlockState<P extends BlockProperties> = {
    id: number
    properties: {
        [K in keyof P]: P[K][number]
    }
}

export type Block<P extends BlockProperties = BlockProperties> = {
    properties: P
    states: BlockState<P>[]
}

const isBlockEntity = (name: string): name is SupportedBlockEntity =>
    Object.keys(blockEntityBuilders).includes(name)

type EncodedVec = `${number},${number},${number}`
const encodeVec3 = (pos: Vec3): EncodedVec => `${pos.x},${pos.y},${pos.z}`

export class BlockHandler {
    private blocks: Map<EncodedVec, Block> = new Map()
    private entities: Map<EncodedVec, BlockEntity> = new Map()

    public getBlock(pos: Vec3): Block | undefined {
        const encoded = encodeVec3(pos)
        return this.blocks.get(encoded)
    }

    public setBlock(pos: Vec3, name: string, block: Block): void {
        const encoded = encodeVec3(pos)
        this.blocks.set(encoded, block)
        console.log(name, isBlockEntity(name))
        if (isBlockEntity(name)) {
            const Builder = blockEntityBuilders[name]
            this.entities.set(encoded, new Builder(pos))
        }
    }

    public getBlockEntity(pos: Vec3): BlockEntity | undefined {
        return this.entities.get(encodeVec3(pos))
    }
}
