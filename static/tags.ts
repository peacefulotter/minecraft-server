import { readdir } from 'node:fs/promises'
import path from 'path'
import type { ItemName } from './recipe'

type MCJSONTagValue = ItemName | `#${string}`

type MCJSONTag = {
    values: MCJSONTagValue[]
}

const dir = path.join(import.meta.dir, 'tags', 'items')
const files = await readdir(dir)

// Values in json can either be a minecraft name id (minecraft:stone) or a list of tags
const itemTags = new Map<string, MCJSONTagValue[]>()

for (const p of files) {
    const file = Bun.file(path.join(dir, p))
    const tag = (await file.json()) as MCJSONTag
    const id = `minecraft:${p.replace('.json', '')}`
    itemTags.set(id, tag.values)
}

// Since tags can be nested, we need to do a recursive search
export const getItemNamesFromTag = (tag: string): ItemName[] => {
    if (itemTags.has(tag)) {
        const tags = itemTags.get(tag) as string[]
        return tags
            .map((tag) =>
                tag.at(0) === '#'
                    ? getItemNamesFromTag(tag.substring(1))
                    : (tag as ItemName)
            )
            .flat()
    }
    return [tag as ItemName]
}
