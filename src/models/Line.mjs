import { Coordinate } from "./Coordinate.mjs";
import { Vector } from "./Vector.mjs";

import {assert} from '../utils/assert.mjs';

export class Line {
    static WIN_LENGTH = 4;
    #origin
    #vector    

    constructor(origin, vector) {
        assert(origin instanceof Coordinate);
        assert(vector instanceof Vector);

        this.#origin = origin;
        this.#vector = vector;
    }

    shiftedToOpposite() {        
        const shiftedOrigin = this.#origin.shifted(this.#vector.opposited().toCoordinate());
        return new Line(shiftedOrigin, this.#vector);
    }

    getCoordinates() {
        let coordinates = [this.#origin];        
        for (let i = 1; i < Line.WIN_LENGTH; i++) {
            coordinates[i] = coordinates[i - 1].shifted(this.#vector.toCoordinate());
        }
        return coordinates;
    }

    isValid() {
        return this.getCoordinates().every(coordinate => coordinate.isValid());
    }
    
}