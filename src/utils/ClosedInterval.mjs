import {assert} from './assert.mjs';

export class ClosedInterval {

    #min;
    #max;

    constructor(min, max) {
        assert(typeof max === "number");
        assert(typeof min === "number");
        assert(max >= min);

        this.#min = min;
        this.#max = max;
    }

    isIncluded(value) {
        assert(typeof value === "number");

        return this.#min <= value && value <= this.#max;
    }

}