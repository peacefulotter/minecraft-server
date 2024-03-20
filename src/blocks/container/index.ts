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

import {
    EntityAnimation,
    OpenScreen,
    SetContainerContent,
} from '~/net/packets/client'
import { DB } from '~/db'
import {
    CONTAINER_INVENTORIES,
    type SupportedInventories,
} from '~/entity/inventory/inventories'
import { EntityAnimations } from '~/data/enum'
import type { Server } from '~/net/server'
import { MergedInventory } from '~/entity/inventory/inventory'

type ChangedSlots = ServerBoundPacketData<
    (typeof ClickContainer)['types']
>['changedSlots']

type ContainerSections = (typeof CONTAINER_INVENTORIES)[SupportedInventories]

export abstract class Container
    extends MergedInventory<ContainerSections>
    implements Interactable
{
    constructor(
        public pos: Vec3,
        public name: BlockName,
        public menuName: SupportedInventories
    ) {
        super(CONTAINER_INVENTORIES[menuName])
    }

    setSlots(changedSlots: ChangedSlots) {
        for (const { slot, item } of changedSlots) {
            this.setItem(slot, item)
        }
    }

    async interact(
        server: Server,
        client: Client,
        packet: UseItemOnData
    ): Promise<void | ClientBoundPacket | ClientBoundPacket[]> {
        // Save container in client
        client.container = this
        // Copy client main + hotbar inventory into container for sync when container is closed
        const clientItems = [
            ...client.inventory.getItemsFromSection('main'),
            ...client.inventory.getItemsFromSection('hotbar'),
        ]
        this.setItemsFromSection('player', clientItems)
        console.log('open screen', this)

        // Send swing offhand animation
        server.broadcast(
            client,
            await EntityAnimation.serialize({
                entityId: client.entityId,
                animation: EntityAnimations.SWING_OFFHAND,
            })
        )

        // And open container screen
        return [
            await OpenScreen.serialize({
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
            }),
            await SetContainerContent.serialize({
                windowId: client.windowId,
                stateId: 0,
                slots: this.getAllItems(),
                carriedItem: undefined,
            }),
        ]
    }
}
