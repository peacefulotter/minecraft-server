export type Vec3 = {
    x: number
    y: number
    z: number
}

export type Position = Vec3 & {
    onGround: boolean
}

export type Rotation = {
    yaw: number
    pitch: number
}

export const deltaPosition = (prev: Position, current: Position) => {
    const change = (p: number, c: number) => (c * 32 - p * 32) * 128
    return {
        deltaX: change(prev.x, current.x),
        deltaY: change(prev.y, current.y),
        deltaZ: change(prev.z, current.z),
    }
}
