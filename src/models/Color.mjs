import {ClosedInterval} from '../utils/ClosedInterval.mjs';
import {assert} from '../utils/assert.mjs';

export class Color {
    
    static RED = new Color(`Red`);
    static YELLOW = new Color(`Yellow`);
    static NULL = new Color(undefined);
    #name;

    constructor(name) {
        this.#name = name;
    }

    static get(ordinal) {
        assert(Number.isInteger(ordinal));
        assert(new ClosedInterval(0, Color.#values().length - 1).isIncluded(ordinal));
        
        return Color.#values()[ordinal];
    }

    static #values() {
        return [Color.RED, Color.YELLOW, Color.NULL];
    }

    isNull() {
        return this === Color.NULL;
    }

    getName() {
        return this.#name;
    }

}