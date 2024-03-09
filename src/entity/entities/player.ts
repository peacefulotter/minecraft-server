import type { Position, Rotation } from '~/position'
import {
    DEFAULT_DATA,
    DEFAULT_POSITION,
    DEFAULT_ROTATION,
    DEFAULT_VELOCITY,
} from '..'
import { MD } from '../metadata'
import { GameMode, MainHand } from '~/data/enum'
import { LivingEntity } from '../living-entity'
import { NBTData } from 'nbtify'
import type { Vec3 } from 'vec3'
import { PlayerInventory } from '../inventory/inventory'
import type { Container } from '~/blocks/container'

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
    inventory = new PlayerInventory()

    username: string | undefined
    isFlying = false

    windowId: number = 1
    container: Container<any> | undefined = undefined

    constructor(
        position: Position = DEFAULT_POSITION,
        onGround: boolean = true,
        rotation: Rotation = DEFAULT_ROTATION,
        velocity: Vec3 = DEFAULT_VELOCITY,
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
            data,
            gameMode
        )
    }

    public [Bun.inspect.custom]() {
        return {
            username: this.username,
            isFlying: this.isFlying,
            ...super[Bun.inspect.custom](),
        }
    }
}
