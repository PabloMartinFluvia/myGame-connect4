import { Player } from "./Player.mjs";
import { Color } from "./Color.mjs";

import {ClosedInterval} from '../utils/ClosedInterval.mjs';
import {assert} from '../utils/assert.mjs';

export class Turn {

    static NUMBER_PLAYERS = 2;
    #players;
    #activePlayer;

    constructor(board) {
        this.#players = [];
        for (let i = 0; i < Turn.NUMBER_PLAYERS; i++) {
            this.#players[i] = new Player(Color.get(i), board);
        }
        this.reset();
    }

    reset() {        
        this.#activePlayer = 0;
    }

    isWinner() {
        return this.getPlayer(this.#activePlayer).isWinner();
    }

    change() {
        this.#activePlayer = (this.#activePlayer + 1) % Turn.NUMBER_PLAYERS;
    }

    getPlayer(ordinal) {
        assert(Number.isInteger(ordinal));
        assert(new ClosedInterval(0, Turn.NUMBER_PLAYERS - 1).isIncluded(ordinal));

        return this.#players[ordinal];
    }

    getIndex() {
        return this.#activePlayer;
    }

}