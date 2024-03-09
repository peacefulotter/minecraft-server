import type { Vec3 } from 'vec3'

import type { Client } from '~/net/client'
import type {
    ClientBoundPacket,
    ServerBoundPacketData,
} from '~/net/packets/create'
import type { UseItemOn } from '~/net/packets/server'
import { EnchantingTable } from './container/enchanting-table'
import { CraftingTable } from './container/crafting-table'
import type { DB } from '~/db'
import type { Server } from '~/net/server'

export type BlockName = keyof typeof DB.blocks

export type UseItemOnData = ServerBoundPacketData<(typeof UseItemOn)['types']>

export interface Interactable {
    pos: Vec3
    name: BlockName

    interact(
        server: Server,
        client: Client,
        packet: UseItemOnData
    ): Promise<void | ClientBoundPacket | ClientBoundPacket[]>
}

export const interactables = {
    'minecraft:enchanting_table': EnchantingTable,
    'minecraft:crafting_table': CraftingTable,
} as const

type SupportedInteractable = keyof typeof interactables

export const isInteractable = (name: string): name is SupportedInteractable =>
    Object.keys(interactables).includes(name)
