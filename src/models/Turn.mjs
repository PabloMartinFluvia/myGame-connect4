import { UserPlayer, RandomPlayer } from "./Players.mjs";
import { Board } from "./Board.mjs";
import { Color } from "./Color.mjs";
import { GameError } from "./Error.mjs";

import { ClosedInterval } from '../utils/ClosedInterval.mjs';
import { assert } from '../utils/assert.mjs';

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

    reset(numUsers) {         
        this.#players = [];           
        if (numUsers !== undefined) {
            this.#configGameMode(numUsers);
        }        
        this.#activePlayer = 0; 
    }

    #configGameMode(numUsers) {
        assert(Turn.getErrorGameMode(numUsers).isNull());

        for (let i = 0; i < Turn.NUMBER_PLAYERS; i++) {
            if (i < numUsers) {
                this.#players[i] = new UserPlayer(Color.get(i), this.#board);
            } else {
                this.#players[i] = new RandomPlayer(Color.get(i), this.#board);
            }
        }        
    }

    static getErrorGameMode(numUsers) {
        assert(Number.isInteger(numUsers));

        let error = GameError.NULL;
        if (!new ClosedInterval(0, Turn.NUMBER_PLAYERS).isIncluded(numUsers)) {
            error = GameError.INVALID_GAME_MODE;
        }
        return error;
    }

    getActivePlayer() {
        return this.#players[this.#activePlayer];
    }

    getNameActivePlayer() {
        return this.getActivePlayer().getName();
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