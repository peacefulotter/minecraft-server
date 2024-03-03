export class BiMap<K = any, V = any> {
    public constructor(
        private map: Map<K, V> = new Map<K, V>(),
        private reverseMap: Map<V, K> = new Map<V, K>()
    ) {}

    public get(key: K): V | undefined {
        return this.getFromKey(key)
    }

    public set(key: K, value: V): void {
        this.setFromKey(key, value)
    }

    public getFromKey(key: K): V | undefined {
        return this.map.get(key)
    }

    public getFromValue(value: V): K | undefined {
        return this.reverseMap.get(value)
    }

    public setFromKey(key: K, value: V): void {
        this.map.set(key, value)
        this.reverseMap.set(value, key)
    }

    public setFromValue(value: V, key: K): void {
        this.setFromKey(key, value)
    }

    public removeByKey(key: K): V | undefined {
        if (this.map.has(key)) {
            let value: V = this.map.get(key) as V

            this.map.delete(key)
            this.reverseMap.delete(value)

            return value
        } else return undefined
    }

    public removeByValue(value: V): K | undefined {
        if (this.reverseMap.has(value)) {
            let key: K = this.reverseMap.get(value) as K

            this.map.delete(key)
            this.reverseMap.delete(value)

            return key
        } else return undefined
    }

    public hasKey(key: K): boolean {
        return this.map.has(key)
    }

    public hasValue(value: V): boolean {
        return this.reverseMap.has(value)
    }

    public clear(): void {
        this.map.clear()
        this.reverseMap.clear()
    }

    public get size(): number {
        return this.map.size
    }

    public entries(): IterableIterator<[K, V]> {
        return this.map.entries()
    }

    public reverseEntries(): IterableIterator<[V, K]> {
        return this.reverseMap.entries()
    }
}
