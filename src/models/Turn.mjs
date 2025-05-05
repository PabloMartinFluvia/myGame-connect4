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
        this.reset();
    }

    reset() {  
        this.#players = [];      
        this.#activePlayer = 0;
    }

    setPlayers(players) {
        assert(players.every(player => player instanceof Player))
        this.#players = players;
    }

    isWinner() {
        return this.getActivePlayer().isWinner();
    }

    change() {
        this.#activePlayer = (this.#activePlayer + 1) % Turn.NUMBER_PLAYERS;
    }

    getActivePlayer() {
        return this.#players[this.#activePlayer];
    }

    /*
    getPlayer(ordinal) {
        assert(Number.isInteger(ordinal));
        assert(new ClosedInterval(0, Turn.NUMBER_PLAYERS - 1).isIncluded(ordinal));

        return this.#players[ordinal];
    }

    getIndex() {
        return this.#activePlayer;
    }
        */

}