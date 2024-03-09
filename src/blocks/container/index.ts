import * as NBT from 'nbtify'
import type { Vec3 } from 'vec3'

import {
    type Interactable,
    type BlockName,
    type UseItemOnData,
} from '../interactable'
import type { ClickContainer } from '~/net/packets/server'
import type {
    ClientBoundPacket,
    ServerBoundPacketData,
} from '~/net/packets/create'
import type { Client } from '~/net/client'

import { EntityAnimation, OpenScreen } from '~/net/packets/client'
import { DB } from '~/db'
import {
    inventories,
    type SupportedInventories,
} from '~/entity/inventory/inventories'
import { EntityAnimations } from '~/data/enum'
import type { Server } from '~/net/server'

type ChangedSlots = ServerBoundPacketData<
    (typeof ClickContainer)['types']
>['changedSlots']

export type BlockMenuName = keyof typeof DB.block_name_to_menu

export abstract class Container<Inv extends SupportedInventories>
    implements Interactable
{
    inventory: ReturnType<(typeof inventories)[Inv]>

    constructor(
        public pos: Vec3,
        public name: BlockName,
        public menuName: Inv
    ) {
        this.inventory = inventories[menuName]() as typeof this.inventory
    }

    insert(changedSlots: ChangedSlots) {
        for (const { slot, item } of changedSlots) {
            this.inventory.setItemFromSlot(slot, item)
        }
    }

    async interact(
        server: Server,
        client: Client,
        packet: UseItemOnData
    ): Promise<void | ClientBoundPacket | ClientBoundPacket[]> {
        // Save container in client
        client.container = this

        // Send swing offhand animation
        server.broadcast(
            client,
            await EntityAnimation.serialize({
                entityId: client.entityId,
                animation: EntityAnimations.SWING_OFFHAND,
            })
        )

        // And open container screen
        return await OpenScreen.serialize({
            windowId: client.windowId,
            windowType: DB.block_name_to_menu[this.menuName],
            windowTitle: new NBT.NBTData(
                NBT.parse(
                    JSON.stringify({
                        color: 'light_purple',
                        text: 'TEST SCREEN',
                        bold: true,
                    })
                ),
                { rootName: null }
            ),
        })
    }
}
