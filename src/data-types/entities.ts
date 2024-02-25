import { ENTITIES_DATABASE } from './entities-db'

// Utility type to get the elements type of an array as a union
type GetArrayElementType<T extends readonly any[]> =
    T extends readonly (infer U)[] ? U : never

// https://github.com/PrismarineJS/minecraft-data/blob/master/data/pc/1.20.3/entities.json
export type Entities = (typeof ENTITIES_DATABASE)[number]

export type EntityTypeId = Entities['id']
export type EntityName = Entities['name']

// Get all entities types
type EntitiesElements = GetArrayElementType<typeof ENTITIES_DATABASE>

// Extract the element type corresponding to a give entity name N
type EntityElement<N extends EntityName> = Extract<
    EntitiesElements,
    { name: N }
>

// Extract the relevant fields from the entity element
type EntityInfo<N extends EntityName> = Pick<
    EntityElement<N>,
    'id' | 'name' | 'displayName' | 'width' | 'height' | 'type' | 'category'
>

// Rename some entity info fields to avoid confusion
type RenamedEntityInfo<N extends EntityName> = Omit<EntityInfo<N>, 'id'> & {
    typeId: Pick<EntityInfo<N>, 'id'>['id']
}

// Map entity name to entity id, name, displayName, width, height, type and category
export type EntityMap = {
    [Name in EntityName]: RenamedEntityInfo<Name>
}

export const entities: EntityMap = ENTITIES_DATABASE.reduce((acc, entity) => {
    const { name, id, displayName, width, height, type, category } = entity
    // as any to fix: Intersection was reduced to 'never' because property 'name' has conflicting types in some constituents.
    ;(acc as any)[name] = {
        typeId: id,
        name: name,
        displayName,
        width,
        height,
        type,
        category,
    } as unknown as RenamedEntityInfo<typeof name>
    return acc
}, {} as EntityMap)
