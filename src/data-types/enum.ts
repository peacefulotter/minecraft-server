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
    SURVIVAL = 0,
    CREATIVE = 1,
    ADVENTURE = 2,
    SPECTATOR = 3,
}

type MCPrefixed<T extends string> = `minecraft:${T}`
type DebugPrefixed<T extends string> = `debug/${T}`

type ReservedChannel = MCPrefixed<'register' | 'unregister'>

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
