import { Coordinate } from "./Coordinate.mjs";
import { Color } from "./Color.mjs";

import { assert } from "../utils/assert.mjs";

class Shiftment {
    static NORTH = new Shiftment(1, 0); 
    static EAST = new Shiftment(0, 1);
    static NORTH_EAST = new Shiftment(1, 1);
    static SOUTH_EAST = new Shiftment(-1, 1);

    #coordinate;

    constructor(row, column) {
        this.#coordinate = new Coordinate(row, column);
    }

    shift(coordinate) {
        assert(coordinate instanceof Coordinate);

        return coordinate.shifted(this.#coordinate);
    }

    oppositeShift(coordinate) {
        assert(coordinate instanceof Coordinate);

        return coordinate.shifted(this.#coordinate.opposited());
    }

}

class Board {
    static #WIN_COUNT = 4;
    #colors;
    #lastDrop;

    constructor() { 
        this.reset();
    }

    reset() {
        this.#colors = [];
        for (let i = 0; i < Coordinate.NUMBER_ROWS; i++) {
            this.#colors[i] = [];
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                this.#colors[i][j] = Color.NULL;
            }
        }
        this.#lastDrop = null;
    }

    isComplete(column) {
        if (column !== undefined) {
            assert(Coordinate.isColumnValid(column));

            return !this.#isEmpty(new Coordinate(Coordinate.NUMBER_ROWS - 1, column));
        }
        
        for (let i = 0; i < Coordinate.NUMBER_COLUMNS; i++) {
            if (!this.isComplete(i)) {
                return false;
            }
        }
        return true;
    }

    #isEmpty(coordinate) {
        return this.getColor(coordinate) === Color.NULL;
    }

    getColor(coordinate) {
        assert(coordinate instanceof Coordinate);
        assert(coordinate.isValid());

        return this.#colors[coordinate.getRow()][coordinate.getColumn()];
    }

    dropToken(column, color) {
        assert(!this.isComplete(column));
        assert(color instanceof Color);
        assert(!color.isNull());

        this.#lastDrop = new Coordinate(0, column);
        while (!this.#isEmpty(this.#lastDrop)) {
            this.#lastDrop = Shiftment.NORTH.shift(this.#lastDrop);            
        }
        this.#colors[this.#lastDrop.getRow()][this.#lastDrop.getColumn()] = color;
    }

    hasWinner() {        
        assert(this.#lastDrop === null || !this.getColor(this.#lastDrop).isNull())

        if (this.#lastDrop === null) {
            return false;
        }       
        for (let shiftment of [Shiftment.NORTH, Shiftment.EAST, Shiftment.NORTH_EAST, Shiftment.SOUTH_EAST]) {
            let candidates = this.#initCandidates(shiftment);
            for (let i = 0; i < Board.#WIN_COUNT; i++) {
                if (this.#isConnect4(candidates)) {
                    return true;
                }            
                candidates = candidates.map(coordinate => shiftment.oppositeShift(coordinate));                
            }
        }
        return false;
    }

    #initCandidates(shiftment) {
        assert(shiftment instanceof Shiftment);

        let coordinates = [this.#lastDrop];
        for (let i = 1; i < Board.#WIN_COUNT; i++) {
            coordinates[i] = shiftment.shift(coordinates[i - 1]);            
        }
        return coordinates;
    }

    #isConnect4(candidates) {
        assert(Array.isArray(candidates));
        assert(candidates.length === Board.#WIN_COUNT);
        assert(candidates.every(coordinate => coordinate instanceof Coordinate));        
        assert(candidates.some(coordinate => coordinate.equals(this.#lastDrop)));
        assert(!this.getColor(this.#lastDrop).isNull())

        if (candidates.some(coordinate => !coordinate.isValid())) {
            return false;
        }
        const color = this.getColor(this.#lastDrop);
        return candidates.every(coordinate => color === this.getColor(coordinate));
    }

}

export { Board };