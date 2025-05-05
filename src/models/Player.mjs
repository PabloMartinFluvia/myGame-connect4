import { Color } from "./Color.mjs";
import { Board } from "./Board.mjs";

import {assert} from '../utils/assert.mjs';

export class Player {

    #color;
    #board;

    constructor(color, board) {
        assert(color instanceof Color);
        assert(board instanceof Board);

        this.#color = color;
        this.#board = board;
    }    

    dropToken(column) {
        this.#board.dropToken(column, this.#color);
    }

    _isComplete(column) {
        return this.#board.isComplete(column);
    }

    isWinner() {
        return this.#board.isWinner(this.#color);
    }

    toString() {
        return this.#color.toString();
    }

}