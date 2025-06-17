import { Evaluator, MinMaxNode } from "./genericminmax.mjs";
import { Combination } from "./Combination.mjs";
import { Board, Shiftment } from "../Board.mjs";
import { Color } from "../Color.mjs";
import { Coordinate } from "../Coordinate.mjs";
import { MachinePlayer } from "../Players.mjs";
import { assert } from "../../utils/assert.mjs";

class BoardEvaluator extends Evaluator {
    #board;

    constructor(board) {
        super();
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

    dropToken(column, color) {
        this.#board.dropToken(column, color)
    }

    removeTop(column) {
        let topPlaced = new Coordinate(Coordinate.NUMBER_ROWS - 1, column);
        while (this.#board.isEmpty(topPlaced)) {
            topPlaced = Shiftment.NORTH.oppositeShift(topPlaced);
        }
        this.#board.setColor(topPlaced, Color.NULL);
    }

    _getCost(isLastChoiceFromMAX) { assert(false) }; // abstract

    get _isWinChoice() {
        return this.#board.hasWinner();
    }

    get _isTieChoice() {
        return this.#board.isComplete();
    }

    get board() {
        return this.#board;
    }
}

class Connect4Node extends MinMaxNode {

    #playerColor;

    constructor(playerColor, evaluator, previousCoichesCount, parentInterval) {
        super(evaluator, previousCoichesCount, parentInterval);
        assert(evaluator instanceof BoardEvaluator);
        assert(playerColor instanceof Color);
        assert(!playerColor.isNull());
        this.#playerColor = playerColor;
    }

    get bestColumn() {
        return this._choice;
    }

    get _choicesAvailables() {
        return this._evaluator.availablesColumns;
    }

    _doChoice(column) {
        const colorToDrop = this._isMaxChoice ? this.#playerColor : this.#playerColor.other;
        this._evaluator.dropToken(column, colorToDrop);
    }

    _undoChoice(column) {
        this._evaluator.removeTop(column);
    }

    _createChildNode() {
        return new Connect4Node(this.#playerColor, this._evaluator,
            this._previousChoicesCount + 1, this._interval);
    }
}

class MinMaxPlayer extends MachinePlayer {

    #evaluator;

    constructor(color, evaluator) {
        assert(evaluator instanceof BoardEvaluator);
        super(color, evaluator.board);

        this.#evaluator = evaluator;
    }

    getColumn() {
        let node = new Connect4Node(this._getColor(), this.#evaluator);
        node.explore();
        return node.bestColumn;
    }

    get _evaluator() {
        return this.#evaluator;
    }
}

class BasicEvaluator extends BoardEvaluator {

    constructor(board) {
        super(board);
    }

    _getCost(isLastChoiceFromMAX) {
        return 0;
    };
}

export class BasicMinMaxPlayer extends MinMaxPlayer {

    constructor(color, board) {
        super(color, new BasicEvaluator(board));
    }
}

class CombinationEvaluator extends BoardEvaluator {

    #combinations;

    constructor(board) {
        super(board);

        this.#combinations = [];
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
            if (combination.isValid) {
                this.#combinations.push(combination);
            }
        }
    }

    syncDrops() {        
        let stillWinnables = [];
        for (let combination of this.#combinations) {
            combination.syncDrops();
            if (combination.isWinnable) {
                stillWinnables.push(combination);
            }
        }
        this.#combinations = stillWinnables;
    }

   
    _getCost(isLastChoiceFromMAX) {
        let cost = 0;
        for (let combination of this.#combinations) {
            combination.syncDrops();
            if (combination.isWinnable && combination.hasColor()) {
                const absValue = this._evaluate(combination);
                const sign = this.#isMaxCombination(isLastChoiceFromMAX, combination) ? 1 : -1;
                cost += absValue * sign ;
            }
        }
        return cost;
    };

    _evaluate(combination) {assert(false)} ; // asbtract


     /* Biconditional logic:

        MAX did last choice  combi.hasLastColor     comb has Max Color
        1                       1                   1
        1                       0                   0
        0                       1                   0
        0                       0                   1    
    */
    #isMaxCombination(isLastChoiceFromMAX, combination) {
        assert(combination.isWinnable && combination.hasColor())

        const lastColor = this.board.getLastColor();
        const isWinnableForLastChooser = combination.hasColor(lastColor)
        return isLastChoiceFromMAX && isWinnableForLastChooser
               ||
               !isLastChoiceFromMAX && !isWinnableForLastChooser;

    }
}

class CombinationMinMax extends MinMaxPlayer {
    constructor(color, evaluator) {
        assert(evaluator instanceof CombinationEvaluator);
        super(color, evaluator)
    }

    getColumn() {
        this._evaluator.syncDrops();
        return super.getColumn();
    }
}

class CombinationMaximizer extends CombinationEvaluator {
    constructor(board) {
        super(board);
    }

    _evaluate(combination) {
        return 1;
    } ; 
}

export class MaxCombinationsMinMaxPlayer extends CombinationMinMax {
    constructor (color, board) {
        super(color, new CombinationMaximizer(board));
    }
}

class ProgressCombinationMaximizer extends CombinationEvaluator {
    constructor(board) {
        super(board);
    }

    _evaluate(combination) {       
        return Math.exp(combination.colorDrops) 
             + Math.pow(combination.colorDrops, combination.colorDrops); // P vs C win // C vs P win

        //return Math.exp(combination.colorDrops); // P vs C FAIL // C vs P win
              
        //return Math.pow(combination.colorDrops, combination.colorDrops); // P vs C win // C vs P TIE

        //return Math.pow(2, combination.colorDrops); // P vs C win // C vs P TIE
        //return combination.colorDrops * 100;  // P vs C win  // C vs P TIE
        //return combination.colorDrops * 10;  // P vs C win  // C vs P TIE
        //return combination.colorDrops * 2;  // P vs C win   // C vs P TIE
        //return combination.colorDrops; // P vs C win // C vs P TIE
        //return combination.colorDrops / Board.WIN_COUNT; // P vs C win // C vs P TIE 

        //return Math.sqrt(combination.colorDrops);  // P vs C TIE // // C vs P TIE            
        
        //return Math.pow(10, combination.colorDrops); // P vs C win // C vs P FAIL
        //return Math.pow(combination.colorDrops, 2); // P vs C win // C vs P FAIL
        //return Math.log(combination.colorDrops);  // P vs C win // C vs P FAIL
        //return Math.log2(combination.colorDrops);  // P vs C win // C vs P FAIL
        //return Math.log10(combination.colorDrops);  // P vs C win // C vs P FAIL
        
    } ; 
}

export class MaxProgressCombinationsMinMaxPlayer extends CombinationMinMax {
    constructor (color, board) {
        super(color, new ProgressCombinationMaximizer(board));
    }
}

class EasyProgressCombinationMaximizer extends CombinationEvaluator {
    constructor(board) {
        super(board);
    }

    _evaluate(combination) {
        let emptyBottonCount = 0;        
        for (let empty of combination.empties) {
            let bottom = Shiftment.NORTH.oppositeShift(empty);
            if (bottom.isValid() && this.board.getColor(bottom).isNull()) {
                emptyBottonCount++;
            }            
        }

        const ratio = combination.colorDrops / (1 + emptyBottonCount);

        //return Math.exp(ratio) + Math.pow(ratio, ratio); // E vs P win // P vs E tie

        //return Math.exp(ratio); // E vs P win // P vs E win
        
        
        //return Math.exp(combination.colorDrops) / Math.exp(1 + emptyBottonCount) 
        //        * Math.exp(combination.colorDrops, -(1 + emptyBottonCount)); 
        // E vs C win // E vs P  tie
        // E vs E 1
        // C vs E win //  P vs E win
        
        

        return Math.exp(combination.colorDrops / (1 + emptyBottonCount)) 
            * 2 * (emptyBottonCount /  combination.colorDrops ) ;
        
        // 2 * e ^ colordrops
    }
}

export class MaxEasyProgressCombinationsMinMaxPlayer extends CombinationMinMax {
    constructor (color, board) {
        super(color, new EasyProgressCombinationMaximizer(board));
    }
}

/*
    Player 2        Random    Basic        MaxComb    MaxProgr    MaxEasy    
Player 1

Random              ??         P2(mostly)    P2          P2        P2
Basic               P1          2            P2          P2         P2
MaxComb             P1         P1            2           P2         P2
MaxProg             P1         P1            P1          1           TIE
MaxEasy             P1         P1            P1          P1          TIE

*/
