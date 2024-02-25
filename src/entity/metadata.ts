import {
    DataByte,
    VarInt,
    DataOptional,
    DataBoolean,
    type Type,
    VarLong,
    DataFloat,
    DataString,
    DataObject,
    DataUUID,
    DataVec3,
    DataPosition,
    DataNBT,
    type InnerWriteType,
} from '~/data/types'
import type { DimensionID, VillagerLevel } from '../../Region-Types/src/java'

const TextComponent = DataNBT
const Slot = DataNBT

const DataParticle = DataNBT // TODO: proper particle type
const DataRotation = DataVec3

export enum Direction {
    DOWN = 0,
    UP,
    NORTH,
    SOUTH,
    WEST,
    EAST,
}

type BlockId = number // TODO: define this properly
const DataBlockId = VarInt as Type<BlockId>

export enum VillagerType {
    'minecraft:desert',
    'minecraft:jungle',
    'minecraft:plains',
    'minecraft:savanna',
    'minecraft:snow',
    'minecraft:swamp',
    'minecraft:taiga',
}

export enum VillagerProfession {
    'minecraft:armorer',
    'minecraft:butcher',
    'minecraft:cartographer',
    'minecraft:cleric',
    'minecraft:farmer',
    'minecraft:fisherman',
    'minecraft:fletcher',
    'minecraft:leatherworker',
    'minecraft:librarian',
    'minecraft:nitwit',
    'minecraft:none',
    'minecraft:mason',
    'minecraft:shepherd',
    'minecraft:toolsmith',
    'minecraft:weaponsmith',
}

const DataVillagerData = DataObject({
    type: VarInt as Type<VillagerType>,
    profession: VarInt as Type<VillagerProfession>,
    level: VarInt as Type<VillagerLevel>,
})

export enum EntityPose {
    STANDING = 0,
    FALL_FLYING,
    SLEEPING,
    SWIMMING,
    SPIN_ATTACK,
    SNEAKING,
    LONG_JUMPING,
    DYING,
    CROAKING,
    USING_TONGUE,
    SITTING,
    ROARING,
    SNIFFING,
    EMERGING,
    DIGGING,
}

const DataGlobalPos = DataObject({
    dimension: VarInt as Type<DimensionID>,
    x: VarLong,
    y: VarLong,
    z: VarLong,
})

export enum SnifferState {
    IDLING = 0,
    FEELING_HAPPY,
    SCENTING,
    SNIFFING,
    SEARCHING,
    DIGGING,
    RISING,
}

const DataQuaternion = DataObject({
    x: DataFloat,
    y: DataFloat,
    z: DataFloat,
    w: DataFloat,
})

const TypeMap = {
    0: DataByte,
    1: VarInt,
    2: VarLong,
    3: DataFloat,
    4: DataString,
    5: TextComponent,
    6: DataOptional(TextComponent),
    7: Slot,
    8: DataBoolean,
    9: DataRotation,
    10: DataPosition,
    11: DataOptional(DataPosition),
    12: VarInt as Type<Direction>,
    13: DataOptional(DataUUID),
    14: DataBlockId,
    15: DataOptional(DataBlockId),
    16: DataNBT,
    17: DataParticle, // TODO: DataParticle ???,
    18: DataVillagerData,
    19: DataOptional(VarInt),
    20: VarInt as Type<EntityPose>,
    21: VarInt, // CAT_VARIANT
    22: VarInt, // FROG_VARIANT
    23: DataOptional(DataGlobalPos),
    24: VarInt, // PAINTING_VARIANT
    25: VarInt as Type<SnifferState>,
    26: DataVec3,
    27: DataQuaternion,
} as const

type TypeIndex = keyof typeof TypeMap
type FieldIndex = number

export const MD = <N extends string, I extends TypeIndex>(
    name: N,
    typeIndex: I,
    value: InnerWriteType<(typeof TypeMap)[I]>
) => ({
    name,
    typeIndex,
    value,
})

export type MetadataSchema = {
    [index: FieldIndex]: ReturnType<typeof MD>
}

type MetadataTypeIndex<T> = T extends { typeIndex: infer T } ? T : never

type MetadataDataType<T> = MetadataTypeIndex<T> extends infer I
    ? I extends TypeIndex
        ? (typeof TypeMap)[I]
        : never
    : never

type MetadataArg<T> = InnerWriteType<MetadataDataType<T>>

export type MetadataArgs<Schema extends MetadataSchema = MetadataSchema> = {
    [key in keyof Schema]?: MetadataArg<Schema[key]>
}

const METADATA_END_INDEX = 0xff

const readMetadata = async (
    buffer: Buffer,
    offset: number,
    metadata: any
): Promise<any> => {
    // Read index
    const { t: index, length: idxLen } = await DataByte.read(buffer, offset)
    if (index === METADATA_END_INDEX) {
        return { metadata, offset: offset + idxLen }
    }

    // Read type
    const { t: typeIndex, length: typeLen } = await VarInt.read(
        buffer,
        offset + idxLen
    )

    // Read value
    const type = TypeMap[typeIndex as TypeIndex]
    const { t: value, length: valLen } = await type.read(
        buffer,
        offset + idxLen + typeLen
    )

    metadata[index] = value

    return await readMetadata(
        buffer,
        offset + idxLen + typeLen + valLen,
        metadata
    )
}

export const DataEntityMetadata = {
    read: async (buffer: Buffer, offset: number) => {
        return readMetadata(buffer, offset, {})
    },
    write: async <Schema extends MetadataSchema>(args: {
        raw: Schema
        metadata: MetadataArgs<Schema>
    }) => {
        const { raw, metadata } = args
        let buffers: Buffer[] = []

        for (const [index, data] of Object.entries(metadata)) {
            if (data === undefined) continue
            const { typeIndex } = raw[parseInt(index)]
            const type = TypeMap[typeIndex as TypeIndex]
            // log('Writing metadata', { index, typeIndex, data })
            buffers.push(
                await DataByte.write(parseInt(index)),
                await VarInt.write(typeIndex),
                await type.write(data as never)
            )
        }

        buffers.push(await DataByte.write(METADATA_END_INDEX))

        return Buffer.concat(buffers)
    },
}
