import { Player } from "./Player.mjs";
import { PlayerVisitor } from "./PlayerVisitor.mjs";
import { Coordinate } from "./Coordinate.mjs";
import { Error } from './Error.mjs'

import { assert } from "../utils/assert.mjs";

export class UserPlayer extends Player {

    constructor(color, board) {
        super(color, board);
    }

    getErrorColumn(column) {
        let error = Error.NULL;
        if (!Coordinate.isColumnValid(column)) {
            error = Error.INVALID_COLUMN;
        } else if (this._isComplete(column)) {
            error = Error.COMPLETED_COLUMN;
        }
        return error;
    }

    accept(visitor) {
        assert(visitor instanceof PlayerVisitor)

        return visitor.visitUserPlayer(this);
    }
}