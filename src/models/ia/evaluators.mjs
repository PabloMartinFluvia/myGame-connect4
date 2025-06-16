import { Combination } from "./Combination.mjs";
import { Board, Shiftment } from "../Board.mjs";
import { Coordinate } from "../Coordinate.mjs";
import { Color } from "../Color.mjs";
import { assert } from "../../utils/assert.mjs";

export class BoardEvaluator {
    #board;

    constructor(board) {
        assert(board instanceof Board);

        this.#board = board;
    }

    get availablesColumns() {
        const columns = [];
        for (let i = 0; i < Coordinate.NUMBER_COLUMNS; i++) {
            if (!this.#board.isComplete(i)) {
                columns.push(i);
            }
        }
        return columns;
    }

    get value() {
        let value;
        if (this.#board.hasWinner()) {
            value = Infinity;
        } else if (this.#board.isComplete()) {
            value = 0;
        } else {
            value = this._valueWhenNotFinished;
        }        
        return value;
    }

    /**
     * Calculates how good is the actual board's state
     * FOR THE PLAYER WHO DROPS IN THE TERMINAL STATE (without winning, neither complete)
     */
    get _valueWhenNotFinished() { assert(false) } // abstract

    removeTop(column) {
        let topPlaced = new Coordinate(Coordinate.NUMBER_ROWS - 1, column);
        while (this.#board.isEmpty(topPlaced)) {
            topPlaced = Shiftment.NORTH.oppositeShift(topPlaced);
        }
        this.#board.setColor(topPlaced, Color.NULL);
    }

    get board() {
        return this.#board;
    }

}

export class BasicEvaluator extends BoardEvaluator {

    constructor(board) {
        super(board);
    }

    get _valueWhenNotFinished() {
        return 0;
    }
}

export class MaximizeAvailableCombinationsEvaluator extends BoardEvaluator {

    #combinationsAvailablesInActualTurn;

    constructor(board) {
        super(board);
        this.#initCombinations();
    }

    #initCombinations() {
        this.#combinationsAvailablesInActualTurn = [];
        for (let row = 0; row < Coordinate.NUMBER_ROWS; row++) {
            for (let column = 0; column < Coordinate.NUMBER_COLUMNS; column++) {
                this.#addCoordinateCombinations(new Coordinate(row, column));
            }
        }
    }

    #addCoordinateCombinations(coordinate) {
        const shiftments = [Shiftment.NORTH, Shiftment.EAST,
                            Shiftment.NORTH_EAST, Shiftment.SOUTH_EAST];
        for (let shiftment of shiftments) {
            const combination = new Combination(coordinate, shiftment, this.board);
            if (combination.valid) {
                this.#combinationsAvailablesInActualTurn.push(combination);
            }
        }
    }

    checkCombinationsAvailables() {
        this.#combinationsAvailablesInActualTurn
            .forEach(combination => { combination.updateProgress() });
        this.#combinationsAvailablesInActualTurn = this.#combinationsAvailablesInActualTurn
            .filter(combination => !combination.discarted);
    }

    get _valueWhenNotFinished() {
        let value = 0;
        const lastColor = this.board.getLastColor();
        for (let combination of this.#combinationsAvailablesInActualTurn) {
            combination.updateProgress();
            if (!combination.discarted && combination.hasColor()) {
                value += this._evaluate(combination) * (combination.hasColor(lastColor) ? 1 : -1);
            }
        }
        return value;
    }

    _evaluate(combination) {
        return 1;
    }
    
}

/*
- ahora cada combinacion disponible en progreso vale "1"
    * combinación tiene al menos una casilla de un color && y las demás estan vacías o con el mismo color
    * una combinación no llega nunca a ser 4 en ralla, ya que solo se evaluan si !board.isFinished()
 Otras ideas:
    - puntuarlas según el % completado 
        * tienen más puntuación como más fichas colocadas ya tengan
    - puntuarlas según la "disponibilidad" de las casillas sin color
        * tienen menos puntuación como más fichas vacías haya debajo de cada casilla sin color
*/

export class WithCompletedPercentageEvaluator extends MaximizeAvailableCombinationsEvaluator {

    constructor(board) {
        super(board);
    }

    _evaluate(combination) {
        return combination.completedPercentage;
    }
}

export class WithAvailabilityAndPercentageEvaluator extends WithCompletedPercentageEvaluator {

    constructor(board) {
        super(board);
    }

    _evaluate(combination) {        
        const empties = combination.empties; 
        let requireds = 0;
        for (let empty of empties) {
            let isBottonPending;
            let bottom;
            do {
                bottom = Shiftment.NORTH.oppositeShift(empty);
                isBottonPending = bottom.isValid() ? 
                        this.board.getColor(bottom).isNull()
                        :
                        false;
                if (isBottonPending) {
                    requireds++;
                    empty = bottom;
                }
            } while (isBottonPending);
        }
        let resultWithPercentage = super._evaluate(combination);
        return resultWithPercentage / (1 + requireds);
    }

}