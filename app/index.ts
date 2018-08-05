import {Action, Dispatch, pipe, Store} from './src/state/state';

import { html, render } from "lit-html/lib/lit-extended";
import produce from 'immer';

interface CounterState {
    count: number;
}

const reducer = async (state: CounterState, action: Action) => produce(state, draft => {
    if (action.type === "INC") {
        draft.count++;
        return draft;
    }
});

const app = (state: CounterState, dispatch: Dispatch) => html`
    <div>
        <label>${state.count}</label>
        <button on-click=${() => dispatch({type: "INC"})}>Count.</button>
    </div>  
`;

const renderer = async (state: CounterState) => {
    render(app(state, store.dispatch), document.body);
    return state;
};

const store = new Store<CounterState>({count: 0}, pipe(reducer, renderer));

store.dispatch({type: "INC"});
