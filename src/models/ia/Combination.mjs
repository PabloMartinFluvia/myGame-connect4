import { Board } from "../Board.mjs";
import { consoleMPDS } from "../../utils/ConsoleMPDS.mjs";
import { assert } from "../../utils/assert.mjs";
import { Color } from "../Color.mjs";

export class Combination {

    #coordinates;
    #colorsCount;
    #board;

    constructor(coordinate, shiftment, board) {
        this.#initCoordinates(coordinate, shiftment);
        this.#initColorCount();
        this.#board = board;
    }

    #initCoordinates(origin, shiftment) {
        this.#coordinates = [origin];
        for (let i = 1; i < Board.WIN_COUNT; i++) {
            this.#coordinates[i] = shiftment.shift(this.#coordinates[i - 1]);
        }
    }

    #initColorCount() {
        this.#colorsCount = [];
        this.#colorsCount[Color.RED.ordinal] = 0;
        this.#colorsCount[Color.YELLOW.ordinal] = 0;
    }

    get valid() {
        return this.#coordinates.every(coordinate => coordinate.isValid());
    }

    updateProgress() {
        this.#colorsCount[Color.RED.ordinal] = this.#getCount(Color.RED);
        this.#colorsCount[Color.YELLOW.ordinal] = this.#getCount(Color.YELLOW);
    }

    #getCount(color) {
        assert(color instanceof Color);
        let count = 0;
        for (let coordinate of this.#coordinates) {
            if (color === this.#board.getColor(coordinate)) {
                count++;
            }
        }
        return count;
    }

    get discarted() {
        return this.#colorsCount[Color.RED.ordinal] > 0 && this.#colorsCount[Color.YELLOW.ordinal] > 0;
    }

    hasColor(color) {
        if (color === undefined) {
            return this.#colorsCount[Color.RED.ordinal] > 0 || this.#colorsCount[Color.YELLOW.ordinal] > 0;
        }

        assert(color instanceof Color);
        assert(!color.isNull());

        return this.#colorsCount[color.ordinal] > 0; 
    }

    get completedPercentage() {
        assert(this.hasColor())
        assert(!this.discarted);

        let count = 0;
        for (let colorCount of this.#colorsCount) {
            count += colorCount;
        }
        return count / Board.WIN_COUNT;
    }

    get empties() {
        const empties = [];
        for (let coordinate of this.#coordinates) {
            if (Color.NULL === this.#board.getColor(coordinate)) {
                empties.push(coordinate);
            }
        }
        return empties;
    }

    //for test - trace
    writeln() {
        let msg = '['
        this.#coordinates.forEach(coordinate => { msg += `[${coordinate.getRow()}, ${coordinate.getColumn()}], ` });
        consoleMPDS.writeln(msg + ']');
    }    

}

