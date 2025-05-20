import { Board } from "../models/Board.mjs";
import { Turn } from "../models/Turn.mjs";
import { assert } from "../utils/assert.mjs";
import { LogicEvents } from "./LogicEvents.mjs";

export class ResumeView {

    #button;
    #turn;
    #board;

    constructor(turn, board) {
        assert(turn instanceof Turn);
        assert(board instanceof Board);

        this.#turn = turn;
        this.#board = board;
        this.#setupButton();
    }

    #setupButton() {
        this.#button = document.createElement('button');
        this.#button.appendChild(document.createTextNode("NUEVA PARTIDA"));        
        this.#button.addEventListener("click", this.#onClickResumeButton.bind(this));
        // TODO: style button  
        const container = document.getElementsByTagName("aside")[0];
        container.appendChild(this.#button);
        this.#disableInteraction();
    }

    allowInteraction() {
        this.#button.style.display = "block";
    }

    #onClickResumeButton(event) {
        assert(this.#button === event.target);
        
        this.#turn.reset();
        this.#board.reset();
        this.#disableInteraction();
        this.#button.dispatchEvent(LogicEvents.INITIAL);
    }

    #disableInteraction() {
        this.#button.style.display = "none";
    }
}