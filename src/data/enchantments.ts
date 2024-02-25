import { EnchantmentResource } from '../../Region-Types/src/java'

// ========================= TYPE VERSION =========================
type EnchantmentName<Id extends string> = Id extends `${infer A}_${infer B}`
    ? `${Capitalize<A>} ${Capitalize<B>}`
    : Capitalize<Id>

type Enchantment<Id extends NoPrefix<EnchantmentResource>> = {
    id: `minecraft:${Id}`
    name: EnchantmentName<Id>
}

type NoPrefix<T extends string> = T extends `minecraft:${infer U}` ? U : T

type Enchantments = {
    [Id in NoPrefix<EnchantmentResource>]: Enchantment<Id>
}

// ========================= VALUE VERSION =========================
const getEnchantmentName = (id: NoPrefix<EnchantmentResource>) =>
    id
        .split('_')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')

const enchantments = Object.keys(EnchantmentResource).reduce((acc, key) => {
    const id = key as NoPrefix<EnchantmentResource>
    const name = getEnchantmentName(id)
    acc[id] = { id: `minecraft:${id}`, name } as any
    return acc
}, {} as Enchantments)

console.log(enchantments)
