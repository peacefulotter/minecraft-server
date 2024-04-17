import type { ShellOutput } from 'bun'

export const handleNonZeroExit = (shellOutput: ShellOutput, message: string, noExit: boolean = false) => {
  if (shellOutput.exitCode !== 0) {
    console.error('\n', message, '\n\n',
      shellOutput.stderr.toString() || shellOutput.stdout.toString()
    )

    !noExit && process.exit(1)
  }
}