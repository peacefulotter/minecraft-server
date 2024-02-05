import {
    DataBoolean,
    DataByte,
    DataInt,
    DataLong,
    DataString,
    VarInt,
    type Type,
    DataPosition,
    DataByteArray,
    DataArray,
} from '~/data-types/basic'
import { createClientBoundPacket } from '../create'
import { GameMode } from '~/data-types/enum'

type BlockEntity = {
    packedXZ: number,
    y: number,
    type: number,
    data: NBT, // TODO
}

const BlockEntity: Type<BlockEntity> = {
read: (buffer: number[]) => {
    const packedXZ = DataInt.read(buffer)
    const y = DataByte.read(buffer)
    const type = DataByte.read(buffer)
    const data = NBT.read(buffer)
    return { packedXZ, y, type, data }
},
write: (t: BlockEntity) => {
    return Buffer.concat([
        DataInt.write(t.packedXZ),
        DataByte.write(t.y),
        DataByte.write(t.type),
        NBT.write(t.data),
    ])
}

export const ChunkDataAndUpdateLight = createClientBoundPacket(
    0x25,
    'ChunkDataAndUpdateLight',
    {
        chunkX: DataInt,
        chunkZ: DataInt,
        heightMaps: NBT, // TODO
        size: VarInt,
        data: DataByteArray, // TODO
        numberOfBlockEntities: VarInt,
        blockEntity: DataArray<BlockEntity>
    }
)

export const PlayLogin = createClientBoundPacket(0x29, 'PlayLogin', {
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
