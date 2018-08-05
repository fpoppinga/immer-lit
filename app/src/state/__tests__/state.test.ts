import { Store } from "../state";

describe("State", () => {
    it("can create a store with initial state", () => {
        const store = new Store({ count: 0 }, async state => state);

        expect(store.state).toEqual({ count: 0 });
    });

    it("can dispatch actions", done => {
        const store = new Store({ count: 0 }, async (state, action) => {
            expect(action.type).toBe("COUNT");
            done();
            return state;
        });

        store.dispatch({ type: "COUNT" });
    });
});
