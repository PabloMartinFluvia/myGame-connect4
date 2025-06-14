import { Board } from "./Board.mjs";
import { Color } from "./Color.mjs";
import { Coordinate } from "./Coordinate.mjs";
import { GameError } from "./Error.mjs";

import {assert} from '../utils/assert.mjs';

class PlayerVisitor {

    visitUserPlayer(userPlayer) {assert(false, 'abstract')}

    visitRandomPlayer(randomPlayer) {assert(false, 'abstract')}
}

class Player {

    #color;
    #board;

    constructor(color, board) {
        assert(color instanceof Color);
        assert(!color.isNull());
        assert(board instanceof Board);

        this.#color = color;
        this.#board = board;
    }    

    accept(visitor) {assert(false, 'abstract')}

    dropToken(column) {
        this.#board.dropToken(column, this.#color);
    }

    _isComplete(column) {
        return this.#board.isComplete(column);
    }

    getName() {
        return this.#color.getName();
    }

    _getColor() {
        return this.#color;
    }

}

class UserPlayer extends Player {

    constructor(color, board) {
        super(color, board);
    }

    accept(visitor) {
        //assert(visitor instanceof PlayerVisitor) // vista web no puede heredar + implementar

        return visitor.visitUserPlayer(this);
    }

    getErrorColumn(column) {
        let error = GameError.NULL;
        if (!Coordinate.isColumnValid(column)) {
            error = GameError.INVALID_COLUMN;
        } else if (this._isComplete(column)) {
            error = GameError.COMPLETED_COLUMN;
        }
        return error;
    }
}

class MachinePlayer extends Player {

    constructor(color, board) {
        super(color, board);
    }

    accept(visitor) {    
        return visitor.visitMachinePlayer(this);
    }

    getColumn() {assert(false);} // abstract

}

class RandomPlayer extends MachinePlayer {

    constructor(color, board) {
        super(color, board);
    }

    getColumn() {
        let column;
        do {
            column = Math.floor(Math.random() * Coordinate.NUMBER_COLUMNS);
        } while (this._isComplete(column));
        return column;
    }

}



export {PlayerVisitor, Player, UserPlayer, MachinePlayer, RandomPlayer};

