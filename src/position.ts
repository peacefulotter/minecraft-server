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
