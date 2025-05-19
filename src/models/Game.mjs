import { Board } from "./Board.mjs";
import { Turn } from "./Turn.mjs";

export class Game {
    #turn;
    #board;

    constructor() {
        this.#board = new Board();
        this.#turn = new Turn(this.#board);
    }

    reset() {
        this.setNumPlayers();
        this.#board.reset();
    }

    setNumPlayers(numPlayers) {
        this.#turn.reset(numPlayers);
    }

    getActivePlayer() {
        return this.#turn.getActivePlayer();
    }

    next() {
        this.#turn.next();
    }

    isFinished() {
        return this.#turn.isLast();
    }


    getTurn() {
        return this.#turn;
    }

    getBoard() {
        return this.#board;
    }
}