import { Coordinate } from "./Coordinate.mjs";

export class Vector {
    static NORTH = new Vector(1, 0); 
    static EAST = new Vector(0, 1);
    static NORTH_EAST = new Vector(1, 1);
    static SOUTH_EAST = new Vector(-1, 1);

    #coordinate;

    constructor(row, column) {
        this.#coordinate = new Coordinate(row, column);
    }

    opposited() {
        const oppositedCoord = this.#coordinate.opposited();
        return new Vector(oppositedCoord.getRow(), oppositedCoord.getColumn());        
    }

    toCoordinate() {
        return this.#coordinate;
    }

}