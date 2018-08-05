export interface Action {
    readonly type: string;
}

interface Reducer<T, A = Action> {
    (state: T, action: A): Promise<T>;
}

export interface Dispatch<A = Action> {
    (action: A): void;
}

export class Store<T, A = Action> {
    private _state: T;
    private trigger: (() => void) | null = null;
    private readonly queue: A[] = [];

    constructor(initialState: T, private consumer: Reducer<T, A>) {
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

    readonly dispatch = (action: A) => {
        this.queue.push(action);

        if (this.trigger) {
            this.trigger();
        }
    }
}

export function pipe<T, A = Action>(...args: Reducer<T, A>[]): Reducer<T, A> {
    return async function(state: T, action: A) {
        let s = state;
        for (const reducer of args) {
            s = await reducer(s, action);
        }
        return s;
    }
}
