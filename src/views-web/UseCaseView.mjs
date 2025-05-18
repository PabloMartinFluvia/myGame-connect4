import { Turn } from "../models/Turn.mjs";
import { Board } from "../models/Board.mjs";
import { assert } from "../utils/assert.mjs";

export class UseCaseView {
    #turn;
    #board;
    #enabled;
    #observers;

    constructor(turn, board) {
        assert(turn instanceof Turn);   
        assert(board instanceof Board); 

        this.#turn = turn;
        this.#board = board;
        this.#enabled = false;
        this.#observers = [];
    }

    addObserver(observer) {
        //todo: assert as instance of ObserverInterface
        this.#observers.push(observer);
    }   

    enable() {
        this.#enabled = true;
    }

    _isEnabled() {
        return this.#enabled;
    }

    _disable() {
        this.#enabled = false;
    } 

    _enableNexts() {
        this.#observers.forEach(observer => {observer.enable()});
    }   

    _getTurn() {
        return this.#turn;
    } 

    _getBoard() {
        return this.#board;
    } 

}