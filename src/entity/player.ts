import type { Position, Rotation, Vec3 } from '~/position'
import {
    DEFAULT_DATA,
    DEFAULT_HEAD_YAW,
    DEFAULT_POSITION,
    DEFAULT_ROTATION,
    DEFAULT_VELOCITY,
    Entity,
} from './entity'
import type { EntityType } from '~/data-types/entities'

export class Player extends Entity {
    username: string | undefined

    constructor(
        public type: EntityType,
        public position: Position = DEFAULT_POSITION,
        public rotation: Rotation = DEFAULT_ROTATION,
        public velocity: Vec3 = DEFAULT_VELOCITY,
        public headYaw: number = DEFAULT_HEAD_YAW,
        public data: number = DEFAULT_DATA
    ) {
        super(type)
    }
}
