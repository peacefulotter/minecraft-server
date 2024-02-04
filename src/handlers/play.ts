import { AcknowledgeMessage } from '~/packets/server'
import { Handler, type Args, link } from '.'

export class PlayHandler extends Handler {
    constructor() {
        super('Play', [
            link(AcknowledgeMessage, PlayHandler.onAcknowledgeMessage),
        ])
        // 0x00: PlayHandler.handleTeleportConfirm,
        // 0x01: PlayHandler.handleTabComplete,
        // 0x02: PlayHandler.handleChatMessage,
        // 0x03: PlayHandler.handleAcknowledgeMessage,
        // 0x04: PlayHandler.handleClientSettings,
        // 0x05: PlayHandler.handleConfirmTransaction,
        // 0x06: PlayHandler.handleEnchantItem,
        // 0x07: PlayHandler.handleClickWindow,
        // 0x08: PlayHandler.handleCloseWindow,
        // 0x09: PlayHandler.handlePluginMessage,
        // 0x0a: PlayHandler.handleEditBook,
        // 0x0b: PlayHandler.handleQueryEntityNbt,
        // 0x0c: PlayHandler.handleUseEntity,
        // 0x0d: PlayHandler.handleKeepAlive,
        // 0x0e: PlayHandler.handlePlayer,
        // 0x0f: PlayHandler.handlePlayerPosition,
        // 0x10: PlayHandler.handlePlayerPositionAndLook,
        // 0x11: PlayHandler.handlePlayerLook,
        // 0x12: PlayHandler.handleVehicleMove,
        // 0x13: PlayHandler.handleSteerBoat,
        // 0x14: PlayHandler.handlePickItem,
        // 0x15: PlayHandler.handleCraftRecipeRequest,
        // 0x16: PlayHandler.handlePlayerAbilities,
        // 0x17: PlayHandler.handlePlayerDigging,
        // 0x18: PlayHandler.handleEntityAction,
        // 0x19: PlayHandler.handleSteerVehicle,
        // 0x1a: PlayHandler.handleCraftingBookData,
        // 0x1b: PlayHandler.handleResourcePackStatus,
        // 0x1c: PlayHandler.handleAdvancementTab,
        // 0x1d: PlayHandler.handleSelectTrade,
        // 0x1e: PlayHandler.handleSetBeaconEffect,
        // 0x1f: PlayHandler.handleHeldItemChange,
        // 0x20: PlayHandler.handleUpdateCommandBlock,
        // 0x21: PlayHandler.handleUpdateCommandBlockMinecart,
        // 0x22: PlayHandler.handleCreativeInventoryAction,
        // 0x23: PlayHandler.handleUpdateJigsawBlock,
        // 0x24: PlayHandler.handleUpdateStructureBlock,
        // 0x25: PlayHandler.handleUpdateSign,
    }

    static onAcknowledgeMessage = async ({
        packet,
    }: Args<typeof AcknowledgeMessage>) => {
        console.log(
            '====================================',
            'handleAcknowledgeMessage'
        )
        console.log(packet)
    }
}
