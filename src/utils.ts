export type ReverseMap<T extends Record<keyof T, keyof any>> = {
    [P in T[keyof T]]: {
        [K in keyof T]: T[K] extends P ? K : never
    }[keyof T]
}

export function reverseRecord<T extends PropertyKey, U extends PropertyKey>(
    input: Record<T, U>
) {
    return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [value, key])
    ) as Record<U, T>
}
