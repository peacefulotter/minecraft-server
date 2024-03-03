import * as NBT from 'nbtify'
import { generateV4, type UUID } from '@minecraft-js/uuid'
import { entities, type EntityMap, type EntityName } from '~/data/entities'
import type { Position, Rotation } from '~/position'
import { GameMode } from '~/data/enum'
import {
    EntityPose,
    MD,
    type MetadataArgs,
    type MetadataSchema,
} from './metadata'
import type { Client } from '~/net/client'
import { SetEntityMetadata } from '~/net/packets/client'
import type { Vec3 } from 'vec3'
import v from 'vec3'

export const DEFAULT_POSITION: Position = v(0, 0, 0)
export const DEFAULT_ON_GROUND = true
export const DEFAULT_ROTATION: Rotation = { pitch: 0, yaw: 0 }
export const DEFAULT_VELOCITY: Vec3 = v(0, 0, 0)
export const DEFAULT_HEAD_YAW = 0
export const DEFAULT_DATA = 0

export type EntityId = number

const generateId = (): EntityId => {
    return Math.floor(Math.random() * 1000000)
}

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
    Schema extends MetadataSchema = MetadataSchema,
    Name extends EntityName = EntityName
> {
    readonly entityId: EntityId = generateId()
    readonly entityUUID: UUID = generateV4()

    readonly metadataSchema: Schema & EntitySchema
    readonly info: EntityMap[Name]
    metadata: MetadataArgs<Schema & EntitySchema>

    position: Position
    rotation: Rotation
    velocity: Vec3

    constructor(
        metadata: Schema,
        public name: Name,
        position: Position = DEFAULT_POSITION,
        rotation: Rotation = DEFAULT_ROTATION,
        velocity: Vec3 = DEFAULT_VELOCITY,
        public onGround: boolean = DEFAULT_ON_GROUND,
        public data: number = DEFAULT_DATA,
        public gameMode: GameMode = GameMode.SURVIVAL
    ) {
        this.metadataSchema = { ...metadata, ...EntityMetadataSchema }
        this.info = entities[name]
        this.metadata = {} as MetadataArgs<Schema & EntitySchema>

        // Make sure its new instances
        this.position = position.clone()
        this.rotation = { ...rotation }
        this.velocity = velocity.clone()
    }

    // Updates metadata and returns the packet to send to the client
    async setMetadata(metadata: MetadataArgs<Schema & EntitySchema>) {
        this.metadata = { ...this.metadata, ...metadata }
        return await SetEntityMetadata(this.metadataSchema).serialize({
            entityId: this.entityId,
            metadata,
        })
    }

    get x() {
        return this.position.x
    }
    get y() {
        return this.position.y
    }
    get z() {
        return this.position.z
    }
    get yaw() {
        return this.rotation.yaw
    }
    get pitch() {
        return this.rotation.pitch
    }
    get velocityX() {
        return this.velocity.x
    }
    get velocityY() {
        return this.velocity.y
    }
    get velocityZ() {
        return this.velocity.z
    }
    get uuid() {
        return this.entityUUID
    }
    get type() {
        return this.info.typeId
    }
    get headYaw() {
        return (this.yaw * 256) / 360
    }

    public [Bun.inspect.custom]() {
        return {
            entityId: this.entityId,
            entityUUID: this.entityUUID,
            name: this.name,
            info: this.info,
            metadata: this.metadata,
            gameMode: GameMode[this.gameMode],
            position: this.position,
            rotation: this.rotation,
            velocity: this.velocity,
            headYaw: this.headYaw,
            data: this.data,
        }
    }
}
