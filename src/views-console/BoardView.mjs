import { Coordinate } from "../models/Coordinate.mjs";
import { Board } from "../models/Board.mjs";

import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";

export class BoardView {

    static #CHARS_PER_CELL = 3;
    static #MIDDLE_CELL = Number.parseInt(BoardView.#CHARS_PER_CELL / 2);
    #board;

    constructor(board) {
        assert(board instanceof Board);

        this.#board = board;
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
        let cellMsg = "";
        for (let i = 0; i < BoardView.#CHARS_PER_CELL; i++) {
            if (i == BoardView.#MIDDLE_CELL) {
                const color = this.#board.getColor(coordinate);
                cellMsg += !color.isNull() ? color.getName()[0] : " ";
            } else {
                cellMsg += " ";
            }
        }
        consoleMPDS.write(cellMsg);
    }


    static #writeHorizontal() {
        const msg = Message.HORIZONTAL_LINE.toString()
            .repeat(1 + BoardView.#CHARS_PER_CELL)
            .repeat(Coordinate.NUMBER_COLUMNS);
        consoleMPDS.write(msg);
        Message.HORIZONTAL_LINE.writeln();
    }

}