import { Color } from "../models/Color.mjs";

import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";

export class ColorView {

    #COLOR_LENGTH;

    constructor(colorLength) {
        assert(Number.isInteger(colorLength));    

        this.#COLOR_LENGTH = colorLength;
    }

    write(color) {
        assert(color instanceof Color);
        assert(color.toString().length > 0);

        let msg = "";
        for (let i = 0; i < this.#COLOR_LENGTH; i++) {
            if (this.#isMiddle(i)) {
                msg += color.toString()[0];
            } else {
                msg += " ";
            }
        }
        consoleMPDS.write(msg);
    }

    #isMiddle(index) {
        assert(Number.isInteger(index));     

        return Number.parseInt(this.#COLOR_LENGTH / 2) === index;
    }
}