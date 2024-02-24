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
        super(type, 'player')
    }

    public toString(): string {
        return super.toString()
    }

    public [Symbol.toPrimitive](): string {
        return this.toString()
    }

    public [Symbol.for('nodejs.util.inspect.custom')](): string {
        return this.toString()
    }
}
