import { Player } from "./Player.mjs";
import { PlayerVisitor } from "./PlayerVisitor.mjs";
import { Coordinate } from "./Coordinate.mjs";

import { assert } from "../utils/assert.mjs";

export class RandomPlayer extends Player {

    constructor(color, board) {
        super(color, board);
    }

    getRandomColumn() {
        let column;
        do {
            column = Math.floor(Math.random() * Coordinate.NUMBER_COLUMNS);
        } while (this._isComplete(column));
        return column;
    }

    accept(visitor) {
        assert(visitor instanceof PlayerVisitor)

        return visitor.visitRandomPlayer(this);
    }
}