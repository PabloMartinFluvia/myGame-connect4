import {ClosedInterval} from '../utils/ClosedInterval.mjs';
import {assert} from '../utils/assert.mjs';

export class Coordinate {

    static NUMBER_ROWS = 6;
    static NUMBER_COLUMNS = 7;
    #row;
    #column;

    constructor(row, column) {
        assert(Number.isInteger(row) && Number.isInteger(column));

        this.#row = row;
        this.#column = column;
    }

    static getRandomColumn() {
        return Math.floor(Math.random() * Coordinate.NUMBER_COLUMNS);
    }

    static #isRowValid(row) {        
        return Number.isInteger(row) 
                && new ClosedInterval(0, Coordinate.NUMBER_ROWS - 1).isIncluded(row);
    }

    static isColumnValid(column) {
        return Number.isInteger(column) 
                && new ClosedInterval(0, Coordinate.NUMBER_COLUMNS - 1).isIncluded(column);
    }

    isValid() {
        return Coordinate.#isRowValid(this.#row) && Coordinate.isColumnValid(this.#column);
    }

    shifted(coordinate) {
        assert(coordinate instanceof Coordinate);

        return new Coordinate(this.#row + coordinate.#row, this.#column + coordinate.#column);
    }

    opposited() {
        return new Coordinate(-1 * this.#row, -1 * this.#column);
    }

    getRow() {
        return this.#row;
    }

    getColumn() {
        return this.#column;
    }
    
}