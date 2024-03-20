import type { IntRange, ValueOf } from 'type-fest'
import type { BlockMenuName } from '~/db'

export const Colors = {
    BLACK: { code: 0x0, name: 'black', hex: '#000000' },
    DARK_BLUE: { code: 0x1, name: 'dark_blue', hex: '#0000AA' },
    DARK_GREEN: { code: 0x2, name: 'dark_green', hex: '#00AA00' },
    DARK_AQUA: { code: 0x3, name: 'dark_aqua', hex: '#00AAAA' },
    DARK_RED: { code: 0x4, name: 'dark_red', hex: '#AA0000' },
    DARK_PURPLE: { code: 0x5, name: 'dark_purple', hex: '#AA00AA' },
    GOLD: { code: 0x6, name: 'gold', hex: '#FFAA00' },
    GRAY: { code: 0x7, name: 'gray', hex: '#AAAAAA' },
    DARK_GRAY: { code: 0x8, name: 'dark_gray', hex: '#555555' },
    BLUE: { code: 0x9, name: 'blue', hex: '#5555FF' },
    GREEN: { code: 0xa, name: 'green', hex: '#55FF55' },
    AQUA: { code: 0xb, name: 'aqua', hex: '#55FFFF' },
    RED: { code: 0xc, name: 'red', hex: '#FF5555' },
    LIGHT_PURPLE: { code: 0xd, name: 'light_purple', hex: '#FF55FF' },
    YELLOW: { code: 0xe, name: 'yellow', hex: '#FFFF55' },
    WHITE: { code: 0xf, name: 'white', hex: '#FFFFFF' },
} as const

export const Styles = {
    RANDOM: { code: 'k', name: 'obfuscated' },
    BOLD: { code: 'l', name: 'bold' },
    STRIKETHROUGH: { code: 'm', name: 'strikethrough' },
    UNDERLINE: { code: 'n', name: 'underline' },
    ITALIC: { code: 'o', name: 'italic' },
} as const

export const Fonts = {
    DEFAULT: { identifier: 'minecraft:default' },
    UNIFORM: { identifier: 'minecraft:uniform' },
    ALT: { identifier: 'minecraft:alt' },
    ILLAGERALT: { identifier: 'minecraft:illageralt' },
} as const

export enum ChatMode {
    ENABLED = 0,
    COMMANDS_ONLY = 1,
    HIDDEN = 2,
}

export enum MainHand {
    LEFT = 0,
    RIGHT = 1,
}

export enum ResourcePackResult {
    SUCCESS,
    DECLINED,
    FAILED_DOWNLOAD,
    ACCEPTED,
    DOWNLOADED,
    INVALID_URL,
    FAILED_RELOAD,
    DISCARDED,
}

export enum Difficulty {
    PEACEFUL = 0,
    EASY = 1,
    NORMAL = 2,
    HARD = 3,
}

export enum GameMode {
    UNDEFINED = -1,
    SURVIVAL = 0,
    CREATIVE = 1,
    ADVENTURE = 2,
    SPECTATOR = 3,
}

// ====================== CHANNELS ======================
type ReservedChannel = MCPrefixed<'register' | 'unregister'>

type MCPrefixed<T extends string> = `minecraft:${T}`
type DebugPrefixed<T extends string> = `debug/${T}`

type MCInternalChannel =
    | 'MC|PingHost'
    | MCPrefixed<
          | 'brand'
          | DebugPrefixed<
                | 'path'
                | 'neighbors_update'
                | 'structures'
                | 'worldgen_attempt'
                | 'poi_ticket_count'
                | 'poi_added'
                | 'poi_removed'
                | 'village_sections'
                | 'goal_selector'
                | 'brain'
                | 'bee'
                | 'hive'
                | 'game_test_add_marker'
                | 'game_test_clear'
                | 'raids'
                | 'game_event'
                | 'game_event_listeners'
            >
      >

type CommunityChannel =
    | 'bungeecord:main'
    | 'fml:handshake'
    | 'fml:play'
    | 'ML|OpenTE'
    | 'WECUI'
    | 'wld:init'
    | 'wld:control'
    | 'wld:request'
    | 'world_info'
    | 'world_id'
    | 'worldinfo:world_id'

export type PluginChannel =
    | ReservedChannel
    | MCInternalChannel
    | CommunityChannel

export type FeatureFlags = MCPrefixed<
    'vanilla' | 'bundle' | 'trade_rebalance' | 'update_1_21'
>

export enum ActionStatus {
    STARTED_DIGGING = 0,
    CANCELLED_DIGGING,
    FINISHED_DIGGING,
    DROP_ITEM_STACK,
    DROP_ITEM,
    SHOOT_ARROW_OR_FINISH_EATING,
    SWAP_ITEM_IN_HAND,
}

export enum Face {
    BOTTOM = 0,
    TOP,
    NORTH,
    SOUTH,
    WEST,
    EAST,
}

export enum PlayerCommandAction {
    START_SNEAKING = 0,
    STOP_SNEAKING,
    LEAVE_BED,
    START_SPRINTING,
    STOP_SPRINTING,
    START_HORSE_JUMP,
    STOP_HORSE_JUMP,
    OPEN_VEHICLE_INVENTORY,
    START_FLYING_WITH_ELYTRA,
}

export enum EntityAnimations {
    SWING_MAIN_ARM = 0,
    LEAVE_BED,
    SWING_OFFHAND,
    CRITICAL_EFFECT,
    MAGIC_CRITICAL_EFFECT,
}

// ====================== CONTAINER PROPERTIES ======================
// https://wiki.vg/Protocol#Set_Container_Property
enum FurnaceProperties {
    FIRE_ICON = 0,
    MAX_FUEL_BURN_TIME,
    PROGRESS_ARROW,
    MAXIMUM_PROGRESS,
}

enum EnchantingTableProperties {
    LEVEL_SLOT_TOP = 0,
    LEVEL_SLOT_MIDDLE,
    LEVEL_SLOT_BOTTOM,
    ENCHANTMENT_SEED,
    ENCHANTMENT_ID_TOP,
    ENCHANTMENT_ID_MIDDLE,
    ENCHANTMENT_ID_BOTTOM,
    ENCHANTMENT_LEVEL_TOP,
    ENCHANTMENT_LEVEL_MIDDLE,
    ENCHANTMENT_LEVEL_BOTTOM,
}

enum BeaconProperties {
    POWER_LEVEL = 0,
    FIRST_POTION_EFFECT,
    SECOND_POTION_EFFECT,
}

enum AnvilProperties {
    REPAIR_COST = 0,
}

enum BrewingStandProperties {
    BREW_TIME = 0,
    FUEL_TIME,
}

enum StonecutterProperties {
    SELECTED_RECIPE = 0,
}

enum LoomProperties {
    SELECTED_PATTERN = 0,
}

enum LecternProperties {
    PAGE = 0,
}

export type ContainerProperties = {
    furnace: FurnaceProperties
    enchanting_table: EnchantingTableProperties
    beacon: BeaconProperties
    anvil: AnvilProperties
    brewing_stand: BrewingStandProperties
    stonecutter: StonecutterProperties
    loom: LoomProperties
    lectern: LecternProperties
}

// ====================== GAME EVENTS ======================
type GameEffect<N extends string, E extends number, V extends number> = {
    name: N
    effect: E
    value: V
}

type GameEventEffect =
    | GameEffect<'NO_RESPAWN_BLOCK_AVAILABLE', 0, number>
    | GameEffect<'END_RAINING', 1, number>
    | GameEffect<'BEGIN_RAINING', 2, number>
    | GameEffect<'CHANGE_GAME_MODE', 3, GameMode>
    | GameEffect<'WIN_GAME', 4, 0 | 1>
    | GameEffect<'DEMO_EVENT', 5, 0 | 101 | 102 | 103 | 104>
    | GameEffect<'ARROW_HIT_PLAYER', 6, number>
    | GameEffect<'RAIN_LEVEL_CHANGE', 7, number> // [0, 1]
    | GameEffect<'THUNDER_LEVEL_CHANGE', 8, number> // [0, 1]
    | GameEffect<'PUFFER_FISH_STING', 9, number>
    | GameEffect<'GUARDIAN_ELDER_APPEARANCE', 10, number>
    | GameEffect<'ENABLE_RESPAWN_SCREEN', 11, 0 | 1>
    | GameEffect<'LIMITED_CRAFTING', 12, 0 | 1>
    | GameEffect<'START_WAITING_CHUNKS', 13, number>

export type GameEvents = ValueOf<{
    [K in GameEventEffect as K['name']]: Omit<K, 'name'>
}>

// ====================== CLICK CONTAINER PROPERTIES ======================
type ClickContainerButton<
    T extends Extract<
        BlockMenuName,
        MCPrefixed<'enchantment' | 'lectern' | 'stonecutter' | 'loom'>
    >,
    B extends number
> = {
    type: T
    buttonId: B
}

export type ClickContainerButtons =
    | ClickContainerButton<'minecraft:enchantment', 0 | 1 | 2>
    | ClickContainerButton<'minecraft:lectern', 1 | 2 | 3 | IntRange<100, 199>>
    | ClickContainerButton<'minecraft:stonecutter', number>
    | ClickContainerButton<'minecraft:loom', number>
