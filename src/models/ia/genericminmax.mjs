import { assert } from "../../utils/assert.mjs";


export class Evaluator {

    /**
     * Cost's sign is coherent with the current player (MAX) perspective. 
     * Good game's state for MAX -> cost > 0;
     * Bad game's state for MAX -> cost < 0;
     */
    getChoiceCost(isLastChoiceFromMAX) {
        let cost;
        if (this._isWinChoice) {
            cost = isLastChoiceFromMAX ? Infinity : -Infinity;
        } else if (this._isTieChoice) {
            cost = 0;
        } else {
            cost = this._getCost(isLastChoiceFromMAX);
        }
        return cost;
    };

    /**
     * Cost's sign is coherent with the current player (MAX) perspective. 
     * Good game's state for MAX -> cost > 0;
     * Bad game's state for MAX -> cost < 0;
     */
    _getCost(isLastChoiceFromMAX) { assert(false) }; // abstract

    get _isWinChoice() { assert(false) } // abstract

    get _isTieChoice() { assert(false) } // abstract

    get isFinished() {
        return this._isWinChoice || this._isTieChoice;
    }
}

export class MinMaxNode {

    static #MAX_CHOICES = 6;
    static #WORST = -Infinity;
    static #BEST = Infinity;

    #evaluator;
    #previousCoichesCount;

    #interval;
    #bestCost;
    #bestChoice

    constructor(evaluator, previousCoichesCount = 0, parentInterval = [MinMaxNode.#WORST, MinMaxNode.#BEST]) {
        assert(evaluator instanceof Evaluator);

        this.#evaluator = evaluator;
        this.#previousCoichesCount = previousCoichesCount;
        let [alpha, beta] = parentInterval;
        this.#interval = [alpha, beta];
        this.#bestCost = this._isMaxChoice ? MinMaxNode.#WORST : MinMaxNode.#BEST;
        this.#bestChoice = null;
    }

    get _choice() {
        assert(this.#isRoot());

        return this.#bestChoice;
    }

    #isRoot() {
        return this.#previousCoichesCount === 0;
    }

    get _isMaxChoice() {
        return this.#previousCoichesCount % 2 === 0;
    }

    explore() {
        assert(this._choicesAvailables.length > 0);

        const choices = this._choicesAvailables;
        for (let i = 0; this.#alpha < this.#beta && i < choices.length; i++) {
            this._doChoice(choices[i]);
            const choiceCost = this.#evaluateChoice();
            if (this._isMaxChoice) {
                this.#maximize(choiceCost, choices[i]);
            } else {
                this.#minimize(choiceCost);
            }
            this._undoChoice(choices[i]);
        }
        if (this.#isRoot() && this.#bestChoice === null) {
            this.#bestChoice = choices[0];            
        }
    }

    get _choicesAvailables() { assert(false) } // abstract   

    get #alpha() {
        return this.#interval[0];
    }

    set #alpha(value) {
        this.#interval[0] = value;
    }

    get #beta() {
        return this.#interval[1];
    }

    set #beta(value) {
        this.#interval[1] = value;
    }

    _doChoice(choice) { assert(false) } // abstract

    _undoChoice(choice) { assert(false) } // abstract

    #evaluateChoice() {
        let cost;
        if (this.#evaluator.isFinished || 1 + this.#previousCoichesCount === MinMaxNode.#MAX_CHOICES) {
            cost = this.#evaluator.getChoiceCost(this._isMaxChoice);
        } else {
            const childNode = this._createChildNode();
            childNode.explore();
            cost = childNode.cost;
        }
        return cost;
    }

    _createChildNode() { assert(false) } // abstract

    get cost() {
        return this.#bestCost;
    }

    #maximize(cost, choice) {
        if (cost > this.#bestCost) {
            this.#bestCost = cost;
            if (this.#isRoot()) {
                this.#bestChoice = choice;
            }
        }

        if (cost > this.#alpha) {
            this.#alpha = cost;
        }
    }

    #minimize(cost) {
        if (cost < this.#bestCost) {
            this.#bestCost = cost;
        }

        if (cost < this.#beta) {
            this.#beta = cost;
        }
    }

    get _evaluator() {
        return this.#evaluator;
    }

    get _previousChoicesCount() {
        return this.#previousCoichesCount;
    }

    get _interval() {
        return this.#interval;
    }
}

