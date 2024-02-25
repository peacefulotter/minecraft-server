import { ORIGIN_VEC } from '~/position'
import { LivingEntity } from './living-entity'
import { MD } from './metadata'

enum ArmorStandMask {
    NOTHING = 0x00,
    SMALL = 0x01,
    ARMS = 0x04,
    NO_BASE_PLATE = 0x08,
    MARKER = 0x10,
}

export const ArmorStandMetadata = {
    15: MD('mask', 0, ArmorStandMask.NOTHING),
    16: MD('headRotation', 9, ORIGIN_VEC),
    20: MD('bodyRotation', 9, ORIGIN_VEC),
    21: MD('leftArmRotation', 9, { x: -10, y: 0, z: -10 }),
    22: MD('rightArmRotation', 9, { x: -15, y: 0, z: 10 }),
    23: MD('leftLegRotation', 9, { x: -1, y: 0, z: -1 }),
    24: MD('rightLegRotation', 9, { x: 1, y: 0, z: 1 }),
}

export class ArmorStand extends LivingEntity<
    typeof ArmorStandMetadata,
    'armor_stand'
> {
    constructor() {
        super(ArmorStandMetadata, 'armor_stand')
    }

    test() {}
}
