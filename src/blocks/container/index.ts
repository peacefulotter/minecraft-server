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

import { EntityAnimations } from '~/data/enum'
import type { Server } from '~/net/server'
import {
    CONTAINER_INVENTORIES,
    PLAYER_INV_SIZE,
    type ContainerInventories,
} from '~/inventory/container'
import { MergedInventory } from '~/inventory/inventory'

type ChangedSlots = ServerBoundPacketData<
    (typeof ClickContainer)['types']
>['changedSlots']

type ContainerInventoriesWithPlayer = {
    [K in keyof ContainerInventories]: ContainerInventories[K] & {
        player: number
    }
}
type ContainerSections<K extends keyof ContainerInventoriesWithPlayer> =
    Extract<ContainerInventoriesWithPlayer, { [key in K]: any }>[K]
type V = ContainerSections<'minecraft:furnace'>

export abstract class Container<K extends keyof ContainerInventoriesWithPlayer>
    extends MergedInventory<ContainerSections<K>>
    implements Interactable
{
    constructor(public pos: Vec3, public name: BlockName, public menuName: K) {
        super({
            ...CONTAINER_INVENTORIES[menuName],
            player: PLAYER_INV_SIZE,
        } as ContainerSections<K>)
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
        console.log('opened screen', this)

        // Fill container test
        // for (let i = 0; i < this.length; i++) {
        //     this.setItem(i, {
        //         itemId: i + 1,
        //         itemCount: i + 1,
        //         nbt: undefined,
        //     })
        // }

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
