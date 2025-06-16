import { assert } from "../../utils/assert.mjs";
import { MachinePlayer } from "../Players.mjs";
import { BasicEvaluator, BoardEvaluator, MaximizeAvailableCombinationsEvaluator, WithAvailabilityAndPercentageEvaluator, WithCompletedPercentageEvaluator } from "./evaluators.mjs";

class MinMaxPlayer extends MachinePlayer {

    static #WORST = -Infinity;
    static #BEST = Infinity;
    static #INITIAL_INTERVAL = [MinMaxPlayer.#WORST, MinMaxPlayer.#BEST];
    static #MAX_DROPS = 6;
    #evaluator;

    constructor(color, evaluator) {
        assert(evaluator instanceof BoardEvaluator);

        super(color, evaluator.board);
        this.#evaluator = evaluator;
    }

    getColumn() {
        return this.#exploreMaxDrops();
    }

    #exploreMaxDrops(parentInterval = MinMaxPlayer.#INITIAL_INTERVAL, dropsCount = 0) {
        assert(this.#evaluator.availablesColumns.length > 0);

        let bestColumn;
        let maxDrop = MinMaxPlayer.#WORST; // different
        let [alpha, beta] = parentInterval;
        const availablesColumns = this.#evaluator.availablesColumns;
        for (let i = 0; alpha < beta && i < availablesColumns.length; i++) {
            const columnToDrop = availablesColumns[i]

            this._board.dropToken(columnToDrop, this._getColor());
            let dropValue;
            if (this.#isTerminalDrop(dropsCount + 1)) {
                dropValue = this.#evaluator.value; // diferent
            } else {
                dropValue = this.#exploreMinDrops([alpha, beta], dropsCount + 1); // different
            }

            if (dropValue > maxDrop) {
                maxDrop = dropValue;
                bestColumn = columnToDrop;
            }

            if (dropValue > alpha) {
                alpha = dropValue;
            }

            this.#evaluator.removeTop(columnToDrop);

            //this.#log(dropsCount, dropValue, columnToDrop, maxDrop, [alpha, beta])            
        }

        if (dropsCount === 0) {
            if (bestColumn === undefined && maxDrop === MinMaxPlayer.#WORST) {
                bestColumn = availablesColumns[0];
            }
            return bestColumn;
        } else {
            return maxDrop;
        }
    }

    #exploreMinDrops(parentInterval, dropsCount) {
        assert(this.#evaluator.availablesColumns.length > 0);

        let minDrop = MinMaxPlayer.#BEST;
        let [alpha, beta] = parentInterval;
        const availablesColumns = this.#evaluator.availablesColumns;
        for (let i = 0; alpha < beta && i < availablesColumns.length; i++) {
            const columnToDrop = availablesColumns[i]
            this._board.dropToken(columnToDrop, this._getColor().other);

            let dropValue;
            if (this.#isTerminalDrop(dropsCount + 1)) {
                dropValue = -1 * this.#evaluator.value;
            } else {
                dropValue = this.#exploreMaxDrops([alpha, beta], dropsCount + 1);
            }

            if (dropValue < minDrop) {
                minDrop = dropValue;
            }

            if (dropValue < beta) {
                beta = dropValue;
            }

            this.#evaluator.removeTop(columnToDrop);

            //this.#log(dropsCount, dropValue, columnToDrop, minDrop, [alpha, beta])            
        }

        return minDrop;
    }

    #isTerminalDrop(dropsCount) {
        return this._board.isComplete() || this._board.hasWinner() || dropsCount === MinMaxPlayer.#MAX_DROPS;
    }

    get _evaluator() {
        return this.#evaluator;
    }

    #log(dropsCount, dropValue, columnToDrop, bestDropValue, [alpha, beta]) {
        let prefix = '\t'.repeat(dropsCount) + `${dropsCount}) `
        prefix += columnToDrop !== undefined ? `column: ${columnToDrop}. ` : "";
        prefix += dropValue !== undefined ? `drop value: ${dropValue}. ` : "";
        console.log(`${prefix}. best value: ${bestDropValue}. interval: [${alpha}, ${beta}]`)
    }

}



export class BasicMinMaxPlayer extends MinMaxPlayer {

    constructor(color, board) {
        super(color, new BasicEvaluator(board));
    }

}

class WithCombinationsMinMaxPlayer extends MinMaxPlayer {
    constructor(color, evaluator) {
        super(color, evaluator)
    }

    getColumn() {
        this._evaluator.checkCombinationsAvailables();
        return super.getColumn();
    }
}



export class MaximizeCombinationsMinMaxPlayer extends WithCombinationsMinMaxPlayer {

    constructor(color, board) {
        super(color, new MaximizeAvailableCombinationsEvaluator(board));
    }

}

export class WithPercentageMinMaxPlayer extends WithCombinationsMinMaxPlayer {
    constructor(color, board) {
        super(color, new WithCompletedPercentageEvaluator(board));
    }
}

export class WithAvailabilityAndPercentageMinMaxPlayer extends WithCombinationsMinMaxPlayer {
    constructor(color, board) {
        super(color, new WithAvailabilityAndPercentageEvaluator(board));
    }
}

/*
Player 1            Random  Basic     Maximize    Percentage    AvailabilityPercentage    
Player 2

Random              ??       P1(bas)  P1(max)      P1(perc)    P1(avai)
Basic               P2(bas)  P2       P1(max)      P1(perc)    P1(avai)
Maximize            P2(max)  P2(max)  P2           P1(perc)    P1(avai) 
Percentage          P2(perc) P2(perc) TIED         P2          P2(perc)!
Availability        P2(avai) P2(avai)  P2(avai)    P2(avai)!    P1

*/
