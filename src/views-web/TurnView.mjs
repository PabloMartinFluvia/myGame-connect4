import { Turn } from "../models/Turn.mjs";
import { assert } from "../utils/assert.mjs";

export class TurnView {

    #turn;
    #turnInfo;
    #resultInfo;

    constructor(turn) {
        assert(turn instanceof Turn);

        this.#turn = turn;
        this.#setupInfo();
    }

    #setupInfo() {
        this.#turnInfo = document.getElementById("turnInfo");
        this.#resultInfo = document.getElementById("resultInfo");
    }

    interact() {
        for(let info of [this.#turnInfo, this.#resultInfo]) {
            info.childNodes.forEach(infoChild => {
                info.removeChild(infoChild);
            });
        }
    }

    show() {
        let turnInfoTextNode = this.#turnInfo.firstChild;
        const msg = "Turn: " + this.#turn.getNameActivePlayer();
        if (turnInfoTextNode !== null) {
            turnInfoTextNode.nodeValue = msg;
        } else {
            turnInfoTextNode = document.createTextNode(msg);
            this.#turnInfo.appendChild(turnInfoTextNode);
        }
    }

    showResult() {
        assert(!this.#resultInfo.hasChildNodes());
        assert(this.#turnInfo.childNodes.length === 1);

        let textNode = this.#turnInfo.firstChild;
        this.#turnInfo .removeChild(textNode);

        let msg = "You've tied";
        if (this.#turn.isWinner()) {
            msg = this.#turn.getNameActivePlayer() + " win!!!";
        }
        textNode = document.createTextNode(msg);
        this.#resultInfo.appendChild(textNode);
    }
}