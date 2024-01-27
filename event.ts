import EventEmitter from 'events'

type EventValue = {
    params: any
    return: any
}

type EventMap = Record<string, EventValue>
type EventKey<T extends EventMap> = string & keyof T
type EventReceiver<V extends EventValue> = (params: V['params']) => V['return']

interface _Emitter<T extends EventMap> {
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void
    emit<K extends EventKey<T>>(
        eventName: K,
        params: T[K]['params']
    ): T[K]['return']
}

export class Emitter<T extends EventMap> implements _Emitter<T> {
    private emitter = new EventEmitter()
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
        this.emitter.on(eventName, fn)
    }

    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
        this.emitter.off(eventName, fn)
    }

    emit<K extends EventKey<T>>(
        eventName: K,
        params: T[K]['params']
    ): T[K]['return'] {
        return this.emitter.emit(eventName, params)
    }
}
