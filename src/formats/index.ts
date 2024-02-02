import * as read from './read'
import * as write from './write'

export const formats = {
    read: read.formatting,
    write: write.formatting,
}
export { createReadPacket } from './read'
export { createWritePacket } from './write'
