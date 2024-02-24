import { generateV4, type UUID } from '@minecraft-js/uuid'
import type { EntityType } from '~/data-types/entities'
import type { Position, Rotation, Vec3 } from '~/position'
import { GameMode } from '~/data-types/enum'

export const DEFAULT_POSITION: Position = { x: 0, y: 0, z: 0, onGround: true }
export const DEFAULT_ROTATION: Rotation = { pitch: 0, yaw: 0 }
export const DEFAULT_VELOCITY: Vec3 = { x: 0, y: 0, z: 0 }
export const DEFAULT_HEAD_YAW = 0
export const DEFAULT_DATA = 0

export type EntityId = number

const generateId = (): EntityId => {
    return Math.floor(Math.random() * 1000000)
}

export class Entity {
    readonly entityId: EntityId = generateId()
    readonly entityUUID: UUID = generateV4()

    constructor(
        public type: EntityType,
        public name: string,
        public position: Position = DEFAULT_POSITION,
        public rotation: Rotation = DEFAULT_ROTATION,
        public velocity: Vec3 = DEFAULT_VELOCITY,
        public headYaw: number = DEFAULT_HEAD_YAW,
        public data: number = DEFAULT_DATA,
        public gameMode: GameMode = GameMode.SURVIVAL
    ) {}
}
