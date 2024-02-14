type MessageFormat<N extends number, T extends string, P> = {
    id: N
    name: T
    params: P
}

export type WorkerMessage = MessageFormat<0x00, 'SpawnEntity', { id: number }>
