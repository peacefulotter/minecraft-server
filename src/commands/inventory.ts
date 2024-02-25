import type { CmdArgs, Command } from './handler'

export const inv: Command<[]> = {
    name: 'inv',
    description: 'Inventory tests',
    callback: async ({ client }: CmdArgs) => {
        // Close Container
        // Set COntainer COntent
        // Open Container
        // Set Slot
        // const packets = []
        // client.write(packets)
    },
    parser: [],
}
