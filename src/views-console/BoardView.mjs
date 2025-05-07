import { Coordinate } from "../models/Coordinate.mjs";
import { Board } from "../models/Board.mjs";

import { Message } from "./Message.mjs";

import { consoleMPDS } from "../utils/ConsoleMPDS.mjs";
import { assert } from "../utils/assert.mjs";

export class BoardView {

    static #CHARS_PER_CELL = 3;
    #board;

    constructor(board) {
        assert(board instanceof Board);

        this.#board = board;
    }

    static #writeHorizontal() {
        const CHARS_PER_LINE = 
            (1 + BoardView.#CHARS_PER_CELL) * Coordinate.NUMBER_COLUMNS  +  1;        
        consoleMPDS.writeln(
            Message.HORIZONTAL_LINE.toString().repeat(CHARS_PER_LINE));        
    }

    write() {
        BoardView.#writeHorizontal();
        for (let row = Coordinate.NUMBER_ROWS - 1; row >= 0; row--) {
            for (let column = 0; column < Coordinate.NUMBER_COLUMNS; column++) {
                this.#writeCell(new Coordinate(row, column))
            }
            Message.VERTICAL_LINE.writeln();
        }
        BoardView.#writeHorizontal();
    }

    #writeCell(coordinate) {
        Message.VERTICAL_LINE.write();
        const color = this.#board.getColor(coordinate);
        for (let i = 0; i < BoardView.#CHARS_PER_CELL; i++) {
            if (BoardView.#isMiddleCell(i) && !color.isNull()) {
                consoleMPDS.write(color.getName()[0]);
            } else {
                Message.ESPACE.write();
            }
        }
    }

    static #isMiddleCell(index) {
        assert(Number.isInteger(index));

        return index === Number.parseInt(BoardView.#CHARS_PER_CELL / 2);
    }

}