import { ClosedInterval } from '../utils/ClosedInterval.mjs';
import { assert } from '../utils/assert.mjs';

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

    static get #playerValues() {
        return [Color.RED, Color.YELLOW];
    }

    isNull() {
        return this === Color.NULL;
    }

    getName() {
        return this.#name;
    }

    get other() {
        assert(this !== Color.NULL);

        return Color.#playerValues[(this.ordinal + 1) % Color.#playerValues.length];
    }

    get ordinal() {
        const values = Color.#values();

        for (let i = 0; i < values.length; i++) {
            if (this === values[i]) {
                return i;
            }
        }
    }

}