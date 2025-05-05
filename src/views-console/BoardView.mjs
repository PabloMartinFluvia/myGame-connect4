import { Coordinate } from "../models/Coordinate.mjs";
import { Board } from "../models/Board.mjs";

import { ColorView } from "./ColorView.mjs";
import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";

export class BoardView {

    static #COLUMN_LENGTH = 4;
    #board;
    #colorView;

    constructor(board) {
        assert(board instanceof Board);

        this.#board = board;
        this.#colorView = new ColorView(BoardView.#COLUMN_LENGTH - 1);
    }

    write() {
        BoardView.#writeHorizontal();
        for (let i = Coordinate.NUMBER_ROWS - 1; i >= 0; i--) {
            Message.VERTICAL_LINE.write();
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                const color = this.#board.getColor(new Coordinate(i, j));
                this.#colorView.write(color);
                Message.VERTICAL_LINE.write();
            }
            consoleMPDS.writeln();
        }
        BoardView.#writeHorizontal();
    }

    static #writeHorizontal() {
        for (let i = 0; i < BoardView.#COLUMN_LENGTH * Coordinate.NUMBER_COLUMNS; i++) {
            Message.HORIZONTAL_LINE.write();
        }
        Message.HORIZONTAL_LINE.writeln();
    }

}