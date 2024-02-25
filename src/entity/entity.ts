import * as NBT from 'nbtify'
import { generateV4, type UUID } from '@minecraft-js/uuid'
import {
    entities,
    type EntityMap,
    type EntityName,
} from '~/data-types/entities'
import type { Position, Rotation, Vec3 } from '~/position'
import { GameMode } from '~/data-types/enum'
import {
    EntityPose,
    MD,
    type MetadataArgs,
    type MetadataSchema,
} from './metadata'

export const DEFAULT_POSITION: Position = { x: 0, y: 0, z: 0, onGround: true }
export const DEFAULT_ROTATION: Rotation = { pitch: 0, yaw: 0 }
export const DEFAULT_VELOCITY: Vec3 = { x: 0, y: 0, z: 0 }
export const DEFAULT_HEAD_YAW = 0
export const DEFAULT_DATA = 0

export type EntityId = number

const generateId = (): EntityId => {
    return Math.floor(Math.random() * 1000000)
}
//     0: L('flags', DataWithDefault(DataByte, 0)),
//     1: L('airTicks', DataWithDefault(VarInt, 300)),
//     2: L('customName', DataOptional(DataNBT)),
//     3: L('isCustomNameVisible', DataWithDefault(DataBoolean, false)),
//     4: L('isSilent', DataWithDefault(DataBoolean, false)),
//     5: L('hasNoGravity', DataWithDefault(DataBoolean, false)),
//     6: L('pose', DataWithDefault(VarInt as Type<Pose>, Pose.STANDING)),
//     7: L('tickFrozenInPowderedSnow', DataWithDefault(VarInt, 0)),

// https://wiki.vg/Entity_metadata#Entity
export enum EntityFlags {
    ON_FIRE = 0x01,
    SNEAKING = 0x02,
    SPRINTING = 0x08,
    SWIMMING = 0x10,
    INVISIBLE = 0x20,
    GLOWING = 0x40,
    ELYTRA_FLYING = 0x80,
}

const EntityMetadataSchema = {
    0: MD('flags', 0, EntityFlags.ON_FIRE),
    1: MD('airTicks', 1, 300),
    2: MD(
        'customName',
        16,
        NBT.parse(
            JSON.stringify({
                color: 'light_purple',
                text: 'CUSTOM NAME',
                bold: true,
            })
        )
    ),
    3: MD('isCustomNameVisible', 8, true),
    4: MD('isSilent', 8, false),
    5: MD('hasNoGravity', 8, false),
    6: MD('pose', 20, EntityPose.STANDING),
    7: MD('tickFrozenInPowderedSnow', 1, 0),
}

export type EntitySchema = typeof EntityMetadataSchema

export abstract class Entity<
    Schema extends MetadataSchema,
    Name extends EntityName
> {
    readonly entityId: EntityId = generateId()
    readonly entityUUID: UUID = generateV4()

    readonly metadataSchema: Schema & EntitySchema
    readonly info: EntityMap[Name]
    metadata: MetadataArgs<Schema & EntitySchema>

    constructor(
        metadata: Schema,
        public name: Name,
        public position: Position = DEFAULT_POSITION,
        public rotation: Rotation = DEFAULT_ROTATION,
        public velocity: Vec3 = DEFAULT_VELOCITY,
        public headYaw: number = DEFAULT_HEAD_YAW,
        public data: number = DEFAULT_DATA,
        public gameMode: GameMode = GameMode.SURVIVAL
    ) {
        this.metadataSchema = { ...metadata, ...EntityMetadataSchema }
        this.info = entities[name]
        this.metadata = {} as MetadataArgs<Schema & EntitySchema>
    }

    setMetadata(metadata: MetadataArgs<Schema & EntitySchema>): void {
        // this.metadata = { ...this.metadata, ...metadata }
    }

    public toString(): string {
        return `Entity 
            entityId: ${this.entityId}
            entityUUID: ${this.entityUUID}
            name: ${this.name}
            info: ${this.info}
            metadata: ${this.metadata}
            gameMode: ${GameMode[this.gameMode]}
            position: ${JSON.stringify(this.position)}
            rotation: ${JSON.stringify(this.rotation)}
            velocity: ${JSON.stringify(this.velocity)}
            headYaw: ${this.headYaw}
            data: ${this.data}
        `
    }

    public [Symbol.toPrimitive](): string {
        return this.toString()
    }

    public [Symbol.for('nodejs.util.inspect.custom')](): string {
        return this.toString()
    }
}
