import { PacketBuffer } from '~/net/PacketBuffer'
import {
    DataFloat,
    VarInt,
    type Type,
    DataBoolean,
    DataOptional,
    DataObject,
    DataByte,
    DataNBT,
    DataString,
    DataInt,
} from '.'
import { isIntegerDistribution, type _IntegerDistribution } from '../registry'
import type {
    DimensionMonsterSpawnLightLevel,
    DimensionMonsterSpawnLightLevelRange,
} from '../../../Region-Types/src/java'
import { Int32 } from 'nbtify'

// https://wiki.vg/Slot_Data
// Differs from the docs since the present field is taken care by DataOptional
export class DataSlot extends DataOptional<DataObject<typeof DataSlot.format>> {
    static format = {
        itemId: new VarInt(),
        itemCount: new DataByte(),
        nbt: new DataOptional(new DataNBT()), // If 0 (TAG_End), there is no NBT data, and no further data follows.
    }
    constructor() {
        super(new DataObject(DataSlot.format))
    }
}

// ============================ INTERACT ============================
type InteractNormal = {
    type: InteractionType.INTERACT
    hand: number
}

type InteractAttack = {
    type: InteractionType.ATTACK
}

type InteractAt = {
    type: InteractionType.INTERACT_AT
    targetX: number
    targetY: number
    targetZ: number
    hand: number
}

type Interact = {
    entityId: number
} & (InteractNormal | InteractAttack | InteractAt) & {
        sneaking: boolean
    }

enum InteractionType {
    INTERACT = 0,
    ATTACK = 1,
    INTERACT_AT = 2,
}

export class DataInteract implements Type<Interact> {
    async readIf<T>(buffer: PacketBuffer, condition: boolean, type: Type<T>) {
        return condition ? await type.read(buffer) : undefined
    }

    async read(buffer: PacketBuffer) {
        const entityId = await VarInt.read(buffer)
        const type = (await VarInt.read(buffer)) as InteractionType
        const targetX = await this.readIf(
            buffer,
            type === InteractionType.INTERACT_AT,
            new DataFloat()
        )
        const targetY = await this.readIf(
            buffer,
            type === InteractionType.INTERACT_AT,
            new DataFloat()
        )
        const targetZ = await this.readIf(
            buffer,
            type === InteractionType.INTERACT_AT,
            new DataFloat()
        )
        const hand = await this.readIf(
            buffer,
            type === InteractionType.INTERACT ||
                type === InteractionType.INTERACT_AT,
            new VarInt()
        )
        const sneaking = await new DataBoolean().read(buffer)
        return {
            entityId,
            type,
            targetX,
            targetY,
            targetZ,
            hand,
            sneaking,
        } as Interact
    }

    async write(t: Interact) {
        return PacketBuffer.concat([
            await VarInt.write(t.entityId),
            await VarInt.write(t.type),
            PacketBuffer.concat(
                t.type === InteractionType.INTERACT_AT
                    ? [
                          await new DataFloat().write(t.targetX as number),
                          await new DataFloat().write(t.targetY as number),
                          await new DataFloat().write(t.targetZ as number),
                      ]
                    : []
            ),
            PacketBuffer.concat(
                t.type === InteractionType.INTERACT ||
                    t.type === InteractionType.INTERACT_AT
                    ? [await new VarInt().write(t.hand as number)]
                    : []
            ),
            await new DataBoolean().write(t.sneaking),
        ])
    }
}

export class DataIntegerDistribution
    extends DataObject<typeof DataIntegerDistribution.format>
    implements Type<_IntegerDistribution>
{
    static format = {
        type: new DataString(),
        value: new DataObject({
            min: new DataInt(),
            max: new DataInt(),
        }),
    }
    constructor() {
        super(DataIntegerDistribution.format)
    }
}

// TODO: fix below
export const DataDimensionMonsterSpawnLightLevel: Type<DimensionMonsterSpawnLightLevel> =
    {
        read: async (buffer: PacketBuffer) => {
            const tagId = await VarInt.read(buffer)
            if (tagId === 0) {
                return new Int32(
                    (await new DataInt().read(
                        buffer
                    )) as DimensionMonsterSpawnLightLevelRange
                ) // as unknown as IntTag<DimensionMonsterSpawnLightLevelRange>
            } else {
                return (await new DataIntegerDistribution().read(
                    buffer
                )) as DimensionMonsterSpawnLightLevel
            }
        },
        write: async (t: DimensionMonsterSpawnLightLevel) => {
            if (typeof t === 'number') {
                return PacketBuffer.concat([
                    await VarInt.write(0),
                    await new DataInt().write(t as number),
                ])
            } else if (isIntegerDistribution(t)) {
                return PacketBuffer.concat([
                    await VarInt.write(1),
                    await new DataIntegerDistribution().write(t),
                ])
            }
            throw new Error('Invalid DimensionMonsterSpawnLightLevel')
        },
    }
