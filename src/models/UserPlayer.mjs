import { Player } from "./Player.mjs";
import { Coordinate } from "./Coordinate.mjs";
import { Error } from './Error.mjs'


export class UserPlayer extends Player {

    constructor(color, board) {
        super(color, board);
    }

    getColumnError(column) {
        let error = Error.NULL;
        if (!Coordinate.isColumnValid(column)) {
            error = Error.INVALID_COLUMN;
        } else if (this._isComplete(column)) {
            error = Error.COMPLETED_COLUMN;
        }
        return error;
    }
}