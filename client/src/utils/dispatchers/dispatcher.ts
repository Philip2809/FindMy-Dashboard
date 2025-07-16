export class Dispatcher<T> {
    private listeners: ((e: T) => void)[] = [];

    next(e: T) {
        for (const listener of this.listeners) {
            listener(e);
        }
    }

    subscribe(listener: (e: T) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
}
