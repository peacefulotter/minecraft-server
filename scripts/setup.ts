import { $ } from 'bun'
import { handleNonZeroExit } from './utils'

console.clear()
$.nothrow()

const MC_SERVER_JAR_URL = 'https://piston-data.mojang.com/v1/objects/8dd1a28015f51b1803213892b50b7b4fc76e594d/server.jar'
const SETUP_DIR = './setup'

console.log('Downloading server jar...')
const serverJar = await fetch(MC_SERVER_JAR_URL)
await Bun.write(`${SETUP_DIR}/server.jar`, serverJar)

console.log('Generating folders...')
const runServerJar = await $`java -DbundlerMainClass=net.minecraft.data.Main -jar server.jar --all`.cwd(SETUP_DIR).quiet()
handleNonZeroExit(runServerJar, 'Error while running server jar')


console.log('Copying files to static folder...')
const neededFiles = ['blocks.json', 'registries.json']
const moveFiles = await $`cp ${neededFiles.map(f => `${SETUP_DIR}/generated/reports/${f}`)} static`.quiet()
handleNonZeroExit(moveFiles, 'Error while copying files')

const [generateFiles] = await Promise.all([
  // (async () => {
  //   console.log('Deleting setup dir...')
  //   return $`rm -rf ${SETUP_DIR}`.quiet()
  // })(),
  (async () => {
    console.log('Generating files in src/db...')
    return $`bun ./static/mapper.ts`.quiet()
  })()
])

// handleNonZeroExit(delSetupDir, 'Error while deleting setup dir', true)
handleNonZeroExit(generateFiles, 'Error while generating files in src/db')

console.log('Setup complete! You can now run the server with `bun start`')