import { UserPlayer, RandomPlayer } from "./Players.mjs";
import { Error } from "./Error.mjs";
import { Color } from "./Color.mjs";

import { ClosedInterval } from '../utils/ClosedInterval.mjs';
import { assert } from '../utils/assert.mjs';
import { Board } from "./Board.mjs";

export class Turn {

    static NUMBER_PLAYERS = 2;
    #players;
    #activePlayer;
    #board;

    constructor(board) {
        assert(board instanceof Board);

        this.reset();
        this.#board = board;
    }

    reset() {
        this.#players = [];
        this.#activePlayer = 0;
    }

    getErrorGameMode(numUsers) {
        let error = Error.NULL;
        if (!new ClosedInterval(0, Turn.NUMBER_PLAYERS).isIncluded(numUsers)) {
            error = Error.INVALID_GAME_MODE;
        }
        return error;
    }

    configGameMode(numUsers) {
        assert(this.getErrorGameMode(numUsers).isNull());

        for (let i = 0; i < Turn.NUMBER_PLAYERS; i++) {
            if (i < numUsers) {
                this.#players[i] = new UserPlayer(Color.get(i), this.#board);
            } else {
                this.#players[i] = new RandomPlayer(Color.get(i), this.#board);
            }
        }
    }

    getActivePlayer() {
        return this.#players[this.#activePlayer];
    }

    next() {
        if (!this.isLast()) {
            this.#activePlayer = (this.#activePlayer + 1) % Turn.NUMBER_PLAYERS;
        }
    } 

    isLast() {
        return this.isWinner() || this.#board.isComplete();
    }

    isWinner() {
        return this.#board.hasWinner();
    }
       
}