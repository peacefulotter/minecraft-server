import { logCmdHandler } from '~/logger'
import { ntt } from './entities'
import type { Args } from '~/handlers'
import { ChatCommand } from '~/net/packets/server'
import { perf } from './performance'

export type CmdArgs = Args<typeof ChatCommand>
type CmdParser<T> = (cmd: string) => T

export type Command<T extends any[] = any[]> = {
    name: string
    description: string
    callback: (args: CmdArgs, ...rest: T) => Promise<void>
    parser: { [K in keyof T]: CmdParser<T[K]> }
}

export const CmdString: CmdParser<string> = (cmd: string) => cmd
export const CmdInt: CmdParser<number> = (cmd: string) => parseInt(cmd, 10)
export const CmdFloat: CmdParser<number> = (cmd: string) => parseFloat(cmd)

export class CommandHandler {
    private readonly commands: Map<string, Command> = new Map()

    constructor() {
        ;[ntt, perf].forEach(this.register.bind(this))
        logCmdHandler(this.commands)
    }

    register(command: Command) {
        this.commands.set(command.name, command)
    }

    async handle(args: Args<typeof ChatCommand>) {
        const { packet } = args
        const { command } = packet
        const [name, ...rest] = command.split(' ')
        if (this.commands.has(command)) {
            const cmd = this.commands.get(name) as Command
            const params = cmd.parser.map((parser, i) => parser(rest[i]))
            return await cmd.callback(args, ...params)
        }
    }
}
