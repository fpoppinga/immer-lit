interface Action {
    readonly type: string;
}

interface Reducer<T> {
    (state: T, action: Action): Promise<T>;
}

export class Store<T> {
    private _state: T;
    private trigger: (() => void) | null = null;
    private readonly queue: Action[] = [];

    constructor(initialState: T, private consumer: Reducer<T>) {
        this._state = initialState;

        this.run();
    }

    private async run() {
        for await (const action of this.producer()) {
            if (!action) {
                continue;
            }

            this._state = await this.consumer(this.state, action);
        }
    }

    private async *producer() {
        for (;;) {
            while (this.queue.length) {
                yield this.queue.shift();
            }

            await new Promise(resolve => (this.trigger = resolve));
            this.trigger = null;
        }
    }

    get state(): T {
        return this._state;
    }

    dispatch(action: Action) {
        this.queue.push(action);

        if (this.trigger) {
            this.trigger();
        }
    }
}
