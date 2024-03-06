import path from 'path'
import { data } from './1.20.4'

const folder = path.join(import.meta.dir, '..', 'src', 'db')

const write = (filename: string, data: any) => {
    const file = path.join(folder, `${filename}.json`)
    console.log('Writing:', file)
    Bun.write(file, JSON.stringify(data, null, 4))
}

// ============ ITEMS ID -> NAME ============
const items_id_to_name = Object.fromEntries(
    Object.entries(data.items.item).map(([key, value]) => {
        return [value.numeric_id, key]
    })
)
write('items_id_to_name', items_id_to_name)

// ========== BLOCKS ID -> NAME ===========
const blocks_id_to_name = Object.fromEntries(
    Object.entries(data.blocks.block).map(([key, value]) => {
        return [value.numeric_id, key]
    })
)
write('blocks_id_to_name', blocks_id_to_name)

// ========== BLOCKS LIST ===========
const blocks = data.blocks.block
write('blocks', blocks)
