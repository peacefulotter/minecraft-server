import type { Vec3 } from 'vec3'
import type { BlockEntityNameMap } from '../../Region-Types/src/java'

import type blocks from '~/db/blocks.json'

type Block = (typeof blocks)[keyof typeof blocks]

const isBlockEntity = (text_id: string): text_id is keyof BlockEntityNameMap =>
    [
        'banner',
        'barrel',
        'beacon',
        'beehive',
        'blast_furnace',
        'brewing_stand',
        'brushable_block',
        'calibrated_sculk_sensor',
        'campfire',
        'chest',
        'chiseled_bookshelf',
        'comparator',
        'command_block',
        'conduit',
        'dispenser',
        'dropper',
        'enchanting_table',
        'end_gateway',
        'furnace',
        'hanging_sign',
        'hopper',
        'jigsaw',
        'jukebox',
        'lectern',
        'mob_spawner',
        'piston',
        'sculk_catalyst',
        'sculk_sensor',
        'sculk_shrieker',
        'shulker_box',
        'sign',
        'skull',
        'smoker',
        'soul_campfire',
        'structure_block',
        'trapped_chest',
    ].includes(text_id)

class BlockEntity {
    constructor(public pos: Vec3, public text_id: keyof BlockEntityNameMap) {}
}

type EncodedVec = `${number},${number},${number}`
const encodeVec3 = (pos: Vec3): EncodedVec => `${pos.x},${pos.y},${pos.z}`

export class BlockHandler {
    private blocks: Map<EncodedVec, Block> = new Map()
    private entities: Map<EncodedVec, BlockEntity> = new Map()

    public getBlock(pos: Vec3): Block | undefined {
        const encoded = encodeVec3(pos)
        return this.blocks.get(encoded)
    }

    public setBlock(pos: Vec3, block: Block): void {
        const encoded = encodeVec3(pos)
        this.blocks.set(encoded, block)
        if (isBlockEntity(block.text_id)) {
            this.entities.set(encoded, new BlockEntity(pos, block.text_id))
        }
    }

    public getBlockEntity(pos: Vec3): BlockEntity | undefined {
        return this.entities.get(encodeVec3(pos))
    }
}
