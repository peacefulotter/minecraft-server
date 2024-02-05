import {
    DataBoolean,
    DataByte,
    DataInt,
    DataLong,
    DataString,
    VarInt,
    type Type,
    DataPosition,
} from '~/data-types/basic'
import { createClientBoundPacket } from '../create'
import { GameMode } from '~/data-types/enum'

export const PlayLogin = createClientBoundPacket(0x29, {
    entityId: DataInt,
    isHardcore: DataBoolean,
    dimensionNames: DataInt, // Array<DimensionName>,
    maxPlayers: VarInt,
    viewDistance: VarInt,
    simulationDistance: VarInt,
    reducedDebugInfo: DataBoolean,
    enableRespawnScreen: DataBoolean,
    doLimitedCrafting: DataBoolean,
    dimensionType: DataInt, // Identifier
    dimensionName: DataString, // Identifier
    hashedSeed: DataLong,
    gameMode: DataByte as Type<GameMode>,
    previousGameMode: DataByte as Type<-1 | GameMode>,
    isDebug: DataBoolean,
    isFlat: DataBoolean,
    hasDeathLocation: DataBoolean,
    deathDimensionName: DataString, // Optional, Identifier
    deathLocation: DataPosition, // Optional
    portalCooldown: VarInt,
})
