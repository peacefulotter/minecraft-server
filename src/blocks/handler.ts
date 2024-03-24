import type { Vec3 } from 'vec3'
import {
    type Interactable,
    isInteractable,
    interactables,
} from './interactable'
import type { Client } from '~/net/client'

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

type EncodedVec = `${number},${number},${number}`
const encodeVec3 = (pos: Vec3): EncodedVec => `${pos.x},${pos.y},${pos.z}`

export class BlockHandler {
    private blocks: Map<EncodedVec, Block> = new Map()
    private interactables: Map<EncodedVec, Interactable> = new Map()

    public getBlock(pos: Vec3): Block | undefined {
        const encoded = encodeVec3(pos)
        return this.blocks.get(encoded)
    }

    public setBlock(
        client: Client,
        pos: Vec3,
        name: string,
        block: Block
    ): void {
        const encoded = encodeVec3(pos)
        this.blocks.set(encoded, block)
        if (isInteractable(name)) {
            const Builder = interactables[name]
            this.interactables.set(encoded, new Builder(server, pos, client))
        }
    }

    public getInteractable(pos: Vec3): Interactable | undefined {
        return this.interactables.get(encodeVec3(pos))
    }
}
