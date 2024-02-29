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
import { PacketBuffer } from '~/net/PacketBuffer'

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

class DataVillagerData extends DataObject<typeof DataVillagerData.format> {
    static format = {
        type: new VarInt() as Type<VillagerType>,
        profession: new VarInt() as Type<VillagerProfession>,
        level: new VarInt() as Type<VillagerLevel>,
    }
    constructor() {
        super(DataVillagerData.format)
    }
}

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

class DataGlobalPos extends DataObject<typeof DataGlobalPos.format> {
    static format = {
        dimension: new VarInt() as Type<DimensionID>,
        x: new VarLong(),
        y: new VarLong(),
        z: new VarLong(),
    }
    constructor() {
        super(DataGlobalPos.format)
    }
}

export enum SnifferState {
    IDLING = 0,
    FEELING_HAPPY,
    SCENTING,
    SNIFFING,
    SEARCHING,
    DIGGING,
    RISING,
}

class DataQuaternion extends DataObject<typeof DataQuaternion.format> {
    static format = {
        x: new DataFloat(),
        y: new DataFloat(),
        z: new DataFloat(),
        w: new DataFloat(),
    }
    constructor() {
        super(DataQuaternion.format)
    }
}

class DataBlockId extends VarInt implements Type<BlockId> {}

const TypeMap = {
    0: new DataByte(),
    1: new VarInt(),
    2: new VarLong(),
    3: new DataFloat(),
    4: new DataString(),
    5: new TextComponent(),
    6: new DataOptional(new TextComponent()),
    7: new Slot(),
    8: new DataBoolean(),
    9: new DataRotation(),
    10: new DataPosition(),
    11: new DataOptional(new DataPosition()),
    12: new VarInt() as Type<Direction>,
    13: new DataOptional(new DataUUID()),
    14: new DataBlockId(),
    15: new DataOptional(new DataBlockId()),
    16: new DataNBT(),
    17: new DataParticle(), // TODO: new DataParticle ???,
    18: new DataVillagerData(),
    19: new DataOptional(VarInt),
    20: new VarInt() as Type<EntityPose>,
    21: new VarInt(), // CAT_VARIANT
    22: new VarInt(), // FROG_VARIANT
    23: new DataOptional(new DataGlobalPos()),
    24: new VarInt(), // PAINTING_VARIANT
    25: new VarInt() as Type<SnifferState>,
    26: new DataVec3(),
    27: new DataQuaternion(),
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

export class DataEntityMetadata<Schema extends MetadataSchema>
    implements Type<MetadataArgs<Schema>>
{
    constructor(private raw: Schema) {}

    readMetadata = async (
        buffer: PacketBuffer,
        metadata: MetadataArgs<Schema>
    ): Promise<MetadataArgs<Schema>> => {
        // Read index
        const b = new DataByte()
        const index = await b.read(buffer)
        if (index === METADATA_END_INDEX) {
            return metadata
        }

        // Read type
        const typeIndex = await VarInt.read(buffer)

        // Read value
        const type = TypeMap[typeIndex as TypeIndex]
        const value = await type.read(buffer)

        metadata[index] = value as any

        return await this.readMetadata(buffer, metadata)
    }

    async read(buffer: PacketBuffer) {
        return await this.readMetadata(buffer, {})
    }

    async write(t: MetadataArgs<Schema>) {
        let buffers: PacketBuffer[] = []

        const b = new DataByte()

        for (const [index, data] of Object.entries(t)) {
            if (data === undefined) continue
            const { typeIndex } = this.raw[parseInt(index)]
            const type = TypeMap[typeIndex as TypeIndex]
            // log('Writing metadata', { index, typeIndex, data })
            buffers.push(
                await b.write(parseInt(index)),
                await VarInt.write(typeIndex),
                await type.write(data as never)
            )
        }

        buffers.push(await b.write(METADATA_END_INDEX))

        return PacketBuffer.concat(buffers)
    }
}
