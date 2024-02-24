import {
    DataByte,
    DataWithDefault,
    VarInt,
    DataOptional,
    DataBoolean,
    type Type,
    VarLong,
    DataFloat,
    DataString,
    DataObject,
    DataUUID,
} from '~/data-types/basic'
import { DataNBT } from '~/data-types/registry'
import type { DimensionID, VillagerLevel } from '../../Region-Types/src/java'
import { ORIGIN_VEC } from '~/position'
import type { InnerType, PacketArguments } from '~/net/packets/create'
import { log } from '~/logger'
import { createPrinter } from 'typescript'

const TextComponent = DataNBT
const Slot = DataNBT
const DataVec3 = DataObject({
    x: DataFloat,
    y: DataFloat,
    z: DataFloat,
})
const DataRotation = DataVec3
const DataPosition = DataVec3

enum Direction {
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

enum VillagerProfession {
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

enum Pose {
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

enum SnifferState {
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
    17: DataNBT, // TODO: DataParticle ???,
    18: DataVillagerData,
    19: DataOptional(VarInt),
    20: VarInt as Type<Pose>,
    21: VarInt, // CAT_VARIANT
    22: VarInt, // FROG_VARIANT
    23: DataOptional(DataGlobalPos),
    24: VarInt, // PAINTING_VARIANT
    25: VarInt as Type<SnifferState>,
    26: DataVec3,
    27: DataQuaternion,
} as const

type TypeIndex = keyof typeof TypeMap

const L = <N extends string, I extends TypeIndex>(name: N, typeIndex: I) => ({
    name,
    typeIndex,
})

type RawMetadata = {
    [index: number]: ReturnType<typeof L>
}

type MetadataTypeIndex<T> = T extends { typeIndex: infer T } ? T : never

type MetadataDataType<T> = MetadataTypeIndex<T> extends infer I
    ? I extends TypeIndex
        ? (typeof TypeMap)[I]
        : never
    : never

type MetadataArg<T> = InnerType<MetadataDataType<T>>

type MetadataArgs<M extends RawMetadata = RawMetadata> = {
    [key in keyof M]?: MetadataArg<M[key]>
}

const METADATA_END_INDEX = 0xff

const readMetadata = async (buffer: number[], metadata: any): Promise<any> => {
    const index = await DataByte.read(buffer)
    if (index === METADATA_END_INDEX) {
        return metadata
    }
    const typeIndex = (await VarInt.read(buffer)) as TypeIndex
    const type = TypeMap[typeIndex]
    const value = await type.read(buffer)
    metadata[index] = value
    return await readMetadata(buffer, metadata)
}

export const DataEntityMetadata = {
    read: async (buffer: number[]) => {
        return readMetadata(buffer, {})
    },
    write: async <R extends RawMetadata>(args: {
        raw: R
        metadata: MetadataArgs<R>
    }) => {
        const { raw, metadata } = args
        let buffer: Buffer = Buffer.from([])
        for (const [index, data] of Object.entries(metadata)) {
            if (data === undefined) continue
            const { typeIndex } = raw[parseInt(index)]
            const type = TypeMap[typeIndex]
            log('Writing metadata', { index, typeIndex, data })
            buffer = Buffer.concat([
                buffer,
                await DataByte.write(parseInt(index)),
                await VarInt.write(typeIndex),
                await type.write(data as never),
            ])
        }
        return Buffer.concat([buffer, await DataByte.write(METADATA_END_INDEX)])
    },
}

// TODO: add default values to L(), see for them below

export const EntityMetadata = {
    0: L('flags', 0),
    1: L('airTicks', 1),
    2: L('customName', 16),
    3: L('isCustomNameVisible', 8),
    4: L('isSilent', 8),
    5: L('hasNoGravity', 8),
    6: L('pose', 20),
    7: L('tickFrozenInPowderedSnow', 1),
} as const

// export type EntityMetadata = MetadataArgs<typeof EntityMetadata>

export const LivingEntityMetadata = {
    ...EntityMetadata,
    8: L('handState', 1),
    9: L('health', 3),
    10: L('potionEffectColor', 1),
    11: L('isPotionEffectAmbient', 8),
    12: L('numberOfArrowsInEntity', 1),
    13: L('numberOfBeeStingersInEntity', 1),
    14: L('locationBedSleepingIn', 11),
}

// export type LivingEntityMetadata = MetadataArgs<typeof LivingEntityMetadata>

export const ArmorStandMetadata = {
    ...LivingEntityMetadata,
    15: L('mask', 0),
    16: L('headRotation', 27),
    20: L('bodyRotation', 27),
    21: L('leftArmRotation', 27),
    22: L('rightArmRotation', 27),
    23: L('leftLegRotation', 27),
    24: L('rightLegRotation', 27),
}

// ============================= OLD =============================
// ============================= KEEP DEFAULT VALUES =============================

// const L = <T>(name: string, type: Type<T>) => {
//     return { name, type }
// }

// export const EntityMetadata = {
//     0: L('flags', DataWithDefault(DataByte, 0)),
//     1: L('airTicks', DataWithDefault(VarInt, 300)),
//     2: L('customName', DataOptional(DataNBT)),
//     3: L('isCustomNameVisible', DataWithDefault(DataBoolean, false)),
//     4: L('isSilent', DataWithDefault(DataBoolean, false)),
//     5: L('hasNoGravity', DataWithDefault(DataBoolean, false)),
//     6: L('pose', DataWithDefault(VarInt as Type<Pose>, Pose.STANDING)),
//     7: L('tickFrozenInPowderedSnow', DataWithDefault(VarInt, 0)),
// }

// const DataBlockPos = DataPosition

// export const ArmorStandMetadata = {
//     ...LivingEntityMetadata,
//     15: L('mask', DataWithDefault(DataByte, 0)),
//     16: L('headRotation', DataWithDefault(DataRotation, ORIGIN_VEC)),
//     20: L('bodyRotation', DataWithDefault(DataRotation, ORIGIN_VEC)),
//     21: L(
//         'leftArmRotation',
//         DataWithDefault(DataRotation, { x: -10, y: 0, z: -10 })
//     ),
//     22: L(
//         'rightArmRotation',
//         DataWithDefault(DataRotation, { x: -15, y: 0, z: 10 })
//     ),
//     23: L(
//         'leftLegRotation',
//         DataWithDefault(DataRotation, { x: -1, y: 0, z: -1 })
//     ),
//     24: L(
//         'rightLegRotation',
//         DataWithDefault(DataRotation, { x: 1, y: 0, z: 1 })
//     ),
// }
