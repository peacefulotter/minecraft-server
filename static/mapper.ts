import path from 'path'
import { data } from './1.20.4'

const folder = path.join(import.meta.dir, '..', 'src', 'db')

// ============ ITEMS ID -> NAME ============
const items_id_to_name = Object.fromEntries(
    Object.entries(data.items.item).map(([key, value]) => {
        return [value.numeric_id, key]
    })
)

const file1 = path.join(folder, 'items_id_to_name.json')
console.log('Writing:', file1)
Bun.write(file1, JSON.stringify(items_id_to_name, null, 4))

// ========== BLOCKS ID -> NAME ===========
const blocks_id_to_name = Object.fromEntries(
    Object.entries(data.blocks.block).map(([key, value]) => {
        return [value.numeric_id, key]
    })
)

const file2 = path.join(folder, 'blocks_id_to_name.json')
console.log('Writing:', file2)
Bun.write(file2, JSON.stringify(blocks_id_to_name, null, 4))
