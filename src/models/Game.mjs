import { Board } from "./Board.mjs";
import { Turn } from "./Turn.mjs";

export class Game {

    #board;
    #turn;    

    constructor() {
        this.#board = new Board();
        this.#turn = new Turn(this.#board);
    }

    isFinished() {
        return this.#turn.isFinished();
    }

    reset() {
        this.#board.reset();
        this.#turn.reset();
    }

    getBoard() {
        return this.#board;
    }

    getTurn() {
        return this.#turn;
    }
}