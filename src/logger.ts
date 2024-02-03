import chalk from 'chalk'

export const log = (...message: any[]) => {
    const d = new Date()
    console.log(chalk.gray(`[${d.toISOString()}]`), ...message)
}
