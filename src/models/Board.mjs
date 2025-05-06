import { Coordinate } from "./Coordinate.mjs";
import { Color } from "./Color.mjs";
import { Vector } from "./Vector.mjs";
import { Line } from "./Line.mjs";

import { assert } from "../utils/assert.mjs";

export class Board {
    #colors;
    #lastDrop;

    constructor() {
        this.#colors = [];
        for (let i = 0; i < Coordinate.NUMBER_ROWS; i++) {
            this.#colors[i] = [];
        }
        this.reset();
    }

    reset() {
        for (let i = 0; i < Coordinate.NUMBER_ROWS; i++) {            
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                this.#colors[i][j] = Color.NULL;
            }
        }
        this.#lastDrop = undefined;
    }

    dropToken(column, color) {
        assert(!this.isComplete(column));
        assert(color instanceof Color);

        this.#lastDrop = new Coordinate(0, column);
        while (!this.#isEmpty(this.#lastDrop)) {
            this.#lastDrop = this.#lastDrop.shifted(Vector.NORTH.toCoordinate());
        }
        this.#colors[this.#lastDrop.getRow()][this.#lastDrop.getColumn()] = color;
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

    isWinner() {
        assert(this.#lastDrop === undefined || !this.getColor(this.#lastDrop).isNull())

        if (this.#lastDrop === undefined) {
            return false;
        }

        for (let vector of [Vector.NORTH, Vector.NORTH_EAST, Vector.EAST, Vector.SOUTH_EAST]) {               
            let line = new Line(this.#lastDrop, vector);
            for (let i = 0; i < Line.WIN_LENGTH; i++) {                
                if (this.#isConnect4(line)) {
                    return true;
                }
                line = line.shiftedToOpposite();
            }
        }
        return false;
    }
    
    #isConnect4(line) {
        assert(line instanceof Line);

        if (!line.isValid()) {
            return false;
        }
        const coordinates = line.getCoordinates();
        for (let i = 1; i < coordinates.length; i++) {
            const color = this.getColor(coordinates[i - 1]);
            if (this.getColor(coordinates[i]) !== color || color.isNull()) {
                return false;
            }
        }
        return true;              
    }
    
}