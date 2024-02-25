import type { EntityName, EntityTypeId } from '~/data/entities'
import {
    DEFAULT_DATA,
    DEFAULT_HEAD_YAW,
    DEFAULT_ON_GROUND,
    DEFAULT_POSITION,
    DEFAULT_ROTATION,
    DEFAULT_VELOCITY,
    Entity,
} from './entity'
import type { Position, Rotation } from '~/position'
import { MD, type MetadataSchema } from './metadata'
import { GameMode } from '~/data/enum'
import type { Vec3 } from 'vec3'

enum HandState {
    NOTHING = 0x00,
    IS_HAND_ACTIVE = 0x01,
    ACTIVE_HAND = 0x02,
    IS_RIPTIDE_SPINNING = 0x04,
}

const LivingEntityMetadataSchema = {
    8: MD('handState', 1, HandState.NOTHING),
    9: MD('health', 3, 1),
    10: MD('potionEffectColor', 1, 0),
    11: MD('isPotionEffectAmbient', 8, false),
    12: MD('numberOfArrowsInEntity', 1, 0),
    13: MD('numberOfBeeStingersInEntity', 1, 0),
    14: MD('locationBedSleepingIn', 11, undefined),
}

export type LivingEntitySchema = typeof LivingEntityMetadataSchema

export abstract class LivingEntity<
    Schema extends MetadataSchema,
    Name extends EntityName
> extends Entity<Schema & LivingEntitySchema, Name> {
    constructor(
        metadata: Schema,
        name: Name,
        position: Position = DEFAULT_POSITION,
        rotation: Rotation = DEFAULT_ROTATION,
        velocity: Vec3 = DEFAULT_VELOCITY,
        onGround: boolean = DEFAULT_ON_GROUND,
        headYaw: number = DEFAULT_HEAD_YAW,
        data: number = DEFAULT_DATA,
        gameMode: GameMode = GameMode.SURVIVAL
    ) {
        super(
            { ...metadata, ...LivingEntityMetadataSchema },
            name,
            position,
            rotation,
            velocity,
            onGround,
            headYaw,
            data,
            gameMode
        )
    }

    public toString(): string {
        return `LivingEntity
            ${super.toString()}`
    }

    public [Symbol.toPrimitive](): string {
        return this.toString()
    }

    public [Symbol.for('nodejs.util.inspect.custom')](): string {
        return this.toString()
    }

    // health: number
    // potionEffectColor: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
    // potionEffectShowIcon: boolean
    // potionEffectDuration: number
    // potionEffectAmplifier: number
    // potionEffectId: number
    // potionEffectAmbient: boolean
    // potionEffectShowParticles: boolean
}
