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

export const ArmorStandMetadataSchema = {
    15: MD('mask', 0, ArmorStandMask.NOTHING),
    16: MD('headRotation', 9, ORIGIN_VEC),
    17: MD('bodyRotation', 9, ORIGIN_VEC),
    18: MD('leftArmRotation', 9, { x: -10, y: 0, z: -10 }),
    19: MD('rightArmRotation', 9, { x: -15, y: 0, z: 10 }),
    20: MD('leftLegRotation', 9, { x: -1, y: 0, z: -1 }),
    21: MD('rightLegRotation', 9, { x: 1, y: 0, z: 1 }),
}

type ArmorStandSchema = typeof ArmorStandMetadataSchema

export class ArmorStand extends LivingEntity<ArmorStandSchema, 'armor_stand'> {
    constructor() {
        super(ArmorStandMetadataSchema, 'armor_stand')
    }
}
