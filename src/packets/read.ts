const protocol = formatting.readVarInt(buffer)
buffer.shift()
const hostname = formatting.readString(buffer, buffer.length - 3)
const port = formatting.readShort(buffer)
const nextState = formatting.readVarInt(buffer) as ClientState.HANDSHAKE | ClientState.LOGIN
