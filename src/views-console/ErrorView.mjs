import { Error } from "../models/Error.mjs";

import { Message } from "./Message.mjs";

import { ClosedInterval } from "../utils/ClosedInterval.mjs";
import { assert } from "../utils/assert.mjs";

export class ErrorView {

    static #MESSAGES = [
        Message.INVALID_GAME_MODE,
        Message.INVALID_COLUMN,
        Message.COMPLETED_COLUMN]
    #error;

    constructor(error) {
        assert(error instanceof Error);
        assert(new ClosedInterval(0, ErrorView.#MESSAGES.length).isIncluded(error.getCode()));
        
        this.#error = error;
    }

    writeln() {
        ErrorView.#MESSAGES[this.#error.getCode()].writeln();
    }
}