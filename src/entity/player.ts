import type { Position, Rotation } from '~/position'
import {
    DEFAULT_DATA,
    DEFAULT_HEAD_YAW,
    DEFAULT_POSITION,
    DEFAULT_ROTATION,
    DEFAULT_VELOCITY,
    Entity,
} from './entity'
import { MD } from './metadata'
import { GameMode, MainHand } from '~/data-types/enum'
import { LivingEntity } from './living-entity'
import { NBTData } from 'nbtify'
import type { Vec3 } from 'vec3'

enum SkinPartsMask {
    NOTHING = 0x00,
    CAPE = 0x01,
    JACKET = 0x02,
    LEFT_SLEEVE = 0x04,
    RIGHT_SLEEVE = 0x08,
    LEFT_PANTS = 0x10,
    RIGHT_PANTS = 0x20,
    HAT = 0x40,
    UNUSED = 0x80,
}

export const PlayerMetadata = {
    15: MD('additionalHearts', 3, 2),
    16: MD('score', 1, 0),
    17: MD('displayedSkinParts', 0, SkinPartsMask.NOTHING),
    18: MD('mainHand', 0, MainHand.RIGHT),
    19: MD('leftShoulderData', 16, new NBTData({})),
    20: MD('rightShoulderData', 16, new NBTData({})),
}

export class Player extends LivingEntity<typeof PlayerMetadata, 'player'> {
    username: string | undefined

    constructor(
        position: Position = DEFAULT_POSITION,
        onGround: boolean = true,
        rotation: Rotation = DEFAULT_ROTATION,
        velocity: Vec3 = DEFAULT_VELOCITY,
        headYaw: number = DEFAULT_HEAD_YAW,
        data: number = DEFAULT_DATA,
        gameMode: GameMode = GameMode.SURVIVAL
    ) {
        super(
            PlayerMetadata,
            'player',
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
        return `Player
            username: ${this.username}
            ${super.toString()}`
    }

    public [Symbol.toPrimitive](): string {
        return this.toString()
    }

    public [Symbol.for('nodejs.util.inspect.custom')](): string {
        return this.toString()
    }
}
