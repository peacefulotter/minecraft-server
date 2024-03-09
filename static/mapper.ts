import path from 'path'
import registries from './registries.json'
import blocks from './blocks.json'

const folder = path.join(import.meta.dir, '..', 'src', 'db')

const groupById = (data: any) =>
    Object.entries(data).reduce((acc, [key, value]: [any, any]) => {
        acc[value['protocol_id']] = key
        return acc
    }, {} as Record<string, string>)

const write = (filename: string, data: any) => {
    const file = path.join(folder, `${filename}.ts`)
    console.log('Writing:', file)
    const content = `export const ${filename} = ${JSON.stringify(
        data,
        null,
        4
    )}`
    Bun.write(file, content)
}

console.log(Object.keys(registries))

//  ============ ITEMS ID -> NAME ============
const itemEntries = registries['minecraft:item']['entries']
write('item_id_to_name', groupById(itemEntries))

//  ========== BLOCKS ID -> NAME ===========
const blockEntries = registries['minecraft:block']['entries']
write('block_id_to_name', groupById(blockEntries))

// ============ BLOCK NAME -> BLOCK DATA ============
write('blocks', blocks)

// ============ BLOCK NAME -> MENU ID ============
const menuEntries = registries['minecraft:menu']['entries']
const blockNameToMenu = Object.entries(menuEntries).reduce(
    (acc, [blockName, menu]) => {
        acc[blockName] = menu.protocol_id
        return acc
    },
    {} as Record<string, number>
)
write('block_name_to_menu', blockNameToMenu)
