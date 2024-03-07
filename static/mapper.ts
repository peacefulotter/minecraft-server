import path from 'path'
import registries from './registries.json'
import blocks from './blocks.json'

const folder = path.join(import.meta.dir, '..', 'src', 'db')

const write = (filename: string, data: any) => {
    const file = path.join(folder, `${filename}.json`)
    console.log('Writing:', file)
    Bun.write(file, JSON.stringify(data, null, 4))
}

console.log(registries)
console.log(Object.keys(registries))

//  ============ ITEMS ID -> NAME ============
const itemEntries = registries['minecraft:item']['entries']
const item_id_to_name = Object.entries(itemEntries).reduce(
    (acc, [key, value]) => {
        acc[value['protocol_id']] = key
        return acc
    },
    {} as Record<string, string>
)
write('item_id_to_name', item_id_to_name)

//  ========== BLOCKS ID -> NAME ===========
const blockEntries = registries['minecraft:block']['entries']
const block_id_to_name = Object.entries(blockEntries).reduce(
    (acc, [key, value]) => {
        acc[value['protocol_id']] = key
        return acc
    },
    {} as Record<string, string>
)
write('block_id_to_name', block_id_to_name)

// ============ BLOCK NAME -> BLOCK DATA ============
write('blocks', blocks)
