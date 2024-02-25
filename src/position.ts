import type { Vec3 } from 'vec3'
import v from 'vec3'

export type Position = Vec3

export type Rotation = {
    yaw: number
    pitch: number
}

export const ORIGIN_VEC = v(0, 0, 0)

export const deltaPosition = (prev: Position, current: Position) => {
    const change = (p: number, c: number) => (c * 32 - p * 32) * 128
    return {
        deltaX: change(prev.x, current.x),
        deltaY: change(prev.y, current.y),
        deltaZ: change(prev.z, current.z),
    }
}
