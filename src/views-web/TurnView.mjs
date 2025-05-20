import { GameError } from "../models/Error.mjs";
import { Turn } from "../models/Turn.mjs";
import { assert } from "../utils/assert.mjs";

export class TurnView {

    #turn;
    #actualTurn;
    #info;

    constructor(turn) {
        assert(turn instanceof Turn);

        this.#turn = turn;     
        this.#setUptActualTurn();   
        this.#setUptInfo();
    }

    #setUptActualTurn() {
        this.#actualTurn = document.createElement("div");
        this.#actualTurn.appendChild(document.createTextNode("----"));
        // TODO: add style
        this.#hideActualTurn();
        document.getElementsByTagName("aside")[0].appendChild(this.#actualTurn);
    }

    #hideActualTurn () {
        this.#actualTurn.style.visibility = "hidden";
    }

    #setUptInfo() {
        this.#info = document.getElementById("info-container");
        this.#info.appendChild(document.createTextNode("----"));
        // TODO: add style
        this.#hideInfo();
    }

     #hideInfo () {
       this.#info.style.visibility = "hidden";
    }

    show() {
        if (!this.#turn.isLast()) {            
            this.#showTurn(this.#turn.getNameActivePlayer());
        } else {            
            this.#hideActualTurn();
            const msg = this.#turn.isWinner() ?
                this.#turn.getNameActivePlayer().toUpperCase() + " WIN!!!" :
                "It's a DRAW!!!";
            this.#showInfo(msg);
        }
    }

    #showTurn(playerName) {
        this.#actualTurn.style.visibility = "visible";
        this.#actualTurn.replaceChild(document.createTextNode("Turn: " + playerName), this.#actualTurn.firstChild);
    }

    #showInfo(msg) {
        this.#info.style.visibility = "visible";
        this.#info.replaceChild(document.createTextNode(msg), this.#info.firstChild);        
    }

    showError(error) {
        assert(error instanceof GameError);
        assert(error.isNull() || error === GameError.COMPLETED_COLUMN);

        if(error.isNull()) {
           this.#hideInfo();
        } else {                    
            this.#showInfo("Column is Full");
        }
    }

    hidde() {
        this.#hideActualTurn();
        this.#hideInfo();
    }
}