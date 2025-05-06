import { assert } from "../utils/assert.mjs";
import { Coordinate } from "./Coordinate.mjs";

export class Shiftment {
    static NORTH = new Shiftment(1, 0); 
    static EAST = new Shiftment(0, 1);
    static NORTH_EAST = new Shiftment(1, 1);
    static SOUTH_EAST = new Shiftment(-1, 1);

    #coordinate;

    constructor(row, column) {
        this.#coordinate = new Coordinate(row, column);
    }

    /*
    opposited() {
        const oppositedCoord = this.#coordinate.opposited();
        return new Shiftment(oppositedCoord.getRow(), oppositedCoord.getColumn());        
    }

    toCoordinate() {
        return this.#coordinate;
    }
    */
    shift(coordinate) {
        assert(coordinate instanceof Coordinate);

        return coordinate.shifted(this.#coordinate);
    }

    shiftOpposite(coordinate) {
        assert(coordinate instanceof Coordinate);

        return coordinate.shifted(this.#coordinate.opposited());
    }

}