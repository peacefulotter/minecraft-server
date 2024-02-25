import { ORIGIN_VEC } from '~/position'
import { LivingEntity } from './living-entity'
import { MD } from './metadata'
import v from 'vec3'

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
    18: MD('leftArmRotation', 9, v(-10, 0, -10)),
    19: MD('rightArmRotation', 9, v(-15, 0, 10)),
    20: MD('leftLegRotation', 9, v(-1, 0, -1)),
    21: MD('rightLegRotation', 9, v(1, 0, 1)),
}

type ArmorStandSchema = typeof ArmorStandMetadataSchema

export class ArmorStand extends LivingEntity<ArmorStandSchema, 'armor_stand'> {
    constructor() {
        super(ArmorStandMetadataSchema, 'armor_stand')
    }
}
