import { UpdateLight } from '~/net/packets/client'
import type { CmdArgs, Command } from './handler'
import BitSet from 'bitset'

export const light: Command<[]> = {
    name: 'light',
    description: 'Tests light updates',
    callback: async ({ client }: CmdArgs) => {
        console.log('azdazd')

        const packet = await UpdateLight.serialize({
            chunkX: 0,
            chunkZ: 0,
            skyLightMask: new BitSet(1),
            blockLightMask: new BitSet(1),
            emptySkyLightMask: new BitSet(0),
            emptyBlockLightMask: new BitSet(0),
            skyLightArray: [Buffer.from(new Uint8Array(2048).fill(0xff))],
            blockLightArray: [Buffer.from(new Uint8Array(2048).fill(0xff))],
        })
        await client.write(packet)
    },
    parser: [],
}
