import { Turn } from "../models/Turn.mjs";
import { assert } from "../utils/assert.mjs";

export class TurnView {

    #turn;
    #actualTurn;
    #result;

    constructor(turn) {
        assert(turn instanceof Turn);

        this.#turn = turn;
        this.#initActualTurn();
        this.#initResult();
    }

    #initActualTurn() {
        this.#actualTurn = document.getElementById("turn");
        this.#actualTurn.appendChild(document.createTextNode("----"));
        // TODO: add style
        this.#hideActualTurn();
    }

    #hideActualTurn() {
        this.#actualTurn.style.visibility = "hidden";
    }

    #initResult() {
        this.#result = document.getElementById("result");
        this.#result.appendChild(document.createTextNode("----"));
        // TODO: add style
        this.#hideResult();
    }

    #hideResult() {
        this.#result.style.visibility = "hidden";
    }

    hidde() {
        this.#hideActualTurn();
        this.#hideResult();
    }

    show() {
        this.#actualTurn.style.visibility = "visible";
        const msg = "Turn: " + this.#turn.getNameActivePlayer();
        this.#actualTurn.replaceChild(document.createTextNode(msg), this.#actualTurn.firstChild);
    }

    showResult() {
        this.#hideActualTurn();
        const msg = this.#turn.isWinner() ?
            this.#turn.getNameActivePlayer().toUpperCase() + " WIN!!!" :
            "It's a DRAW!!!";
        this.#result.style.visibility = "visible";
        this.#result.replaceChild(document.createTextNode(msg), this.#result.firstChild);
    }    
}