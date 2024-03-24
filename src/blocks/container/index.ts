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
    type ContainerInventories,
} from '~/inventory/container'
import { MergedInventory, type InventoryItem } from '~/inventory/inventory'
import type { SocketId } from '~/socket'

type ChangedSlots = ServerBoundPacketData<
    (typeof ClickContainer)['types']
>['changedSlots']

/**
 * Code to merge multiple inventories into one
 *
 * type ContainerInventoriesWithPlayer = {
 *    [K in keyof ContainerInventories]: ContainerInventories[K] & {
 *       player: number
 *    }
 * }
 * type ContainerSections<K extends keyof ContainerInventoriesWithPlayer> =
 *    Extract<ContainerInventoriesWithPlayer, { [key in K]: any }>[K]
 */

// TODO: not all Containers are shared (eg crafting table)
class SharedContainerInventory<
    K extends keyof ContainerInventories
> extends MergedInventory<ContainerInventories[K]> {
    clients = new Set<SocketId>()

    constructor(
        protected readonly server: Server,
        shared: ContainerInventories[K]
    ) {
        super(shared)
        this.addListener(async () => {
            for (const id of this.clients.values()) {
                const client = this.server.getClient(id)
                client.write(await this.getSetContainerContent(client))
            }
        })
    }

    async getSetContainerContent(client: Client) {
        return await SetContainerContent.serialize({
            windowId: client.windowId,
            stateId: 0,
            slots: [
                ...this.getAllItems(),
                ...client.inventory.getItemsFromSection('main'),
                ...client.inventory.getItemsFromSection('hotbar'),
            ],
            carriedItem: client.carriedItem?.item,
        })
    }

    addClient(client: Client) {
        this.clients.add(client.entityId)
    }

    removeClient(client: Client) {
        this.clients.delete(client.entityId)
    }

    // Converts a container slot to a player inventory slot
    toPlayerSlot(client: Client, slot: number) {
        return slot - this.length + client.inventory.getSectionOffset('main')
    }

    // On player carrying an item, remove it from wherever it was taken (container or player inventory)
    // and set it as the player's carried item
    carryItem(client: Client, slot: number, item: InventoryItem) {
        console.log('Setting carried item to', slot, item)
        client.carriedItem = { slot, item }
        this.setItemWithPlayer(client, slot, undefined)
    }

    // Be able to set items from the player inventory as well
    setItemWithPlayer(
        client: Client,
        slot: number,
        item: InventoryItem | undefined
    ) {
        if (slot > this.length) {
            client.inventory.setItemFrom('main', slot, item)
        } else {
            const playerSlot = this.toPlayerSlot(client, slot)
            this.setItem(playerSlot, item)
        }
    }

    setChangedItems(client: Client, items: ChangedSlots) {
        for (const { slot, item } of items) {
            this.setItemWithPlayer(client, slot, item)
        }
    }
}

// K extends keyof ContainerInventoriesWithPlayer
export abstract class Container<K extends keyof ContainerInventories>
    extends SharedContainerInventory<K>
    implements Interactable
{
    constructor(
        readonly server: Server,
        public pos: Vec3,
        public readonly name: BlockName,
        public readonly menuName: K
    ) {
        super(server, CONTAINER_INVENTORIES[menuName])
    }

    async interact(
        client: Client,
        packet: UseItemOnData
    ): Promise<void | ClientBoundPacket | ClientBoundPacket[]> {
        // Save container in client
        client.container = this
        // Add client to container
        this.addClient(client)

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
            await this.getSetContainerContent(client),
        ]
    }

    public [Bun.inspect.custom]() {
        return {
            pos: this.pos,
            name: this.name,
            inv: this.inv,
            sections: this.sections,
        }
    }
}
