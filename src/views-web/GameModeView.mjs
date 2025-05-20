
import { Turn } from "../models/Turn.mjs";
import { assert } from "../utils/assert.mjs";

export class GameModeView{
            
    #buttons;
    #turn; 
    #onGameCallBack;


    constructor(turn, onGameCallback) {
        assert(turn instanceof Turn);
        assert(typeof onGameCallback === "function");
        
        this.#turn = turn;
        this.#onGameCallBack = onGameCallback;
        this.#setupButtons();             
    }

    #setupButtons() {
        this.#buttons = [];        
        const MODE_OPTIONS = ["RANDOM vs RANDOM", "JUGADOR vs RANDOM", "JUGADOR vs JUGADOR"];
        for (let numPlayers = MODE_OPTIONS.length - 1; numPlayers >=0 ; numPlayers--) {
            const button = document.createElement('button');            
            button.numPlayers = numPlayers;            
            button.appendChild(document.createTextNode(MODE_OPTIONS[numPlayers]));            
            this.#buttons.push(button);                   
        }              
        const onClickListener = this.#onClickModeButton.bind(this);  
        const container = document.getElementsByTagName("aside")[0];      
        this.#buttons.forEach(button => {            
            button.addEventListener("click", onClickListener);
            container.appendChild(button);
            // TODO: style button     
        });  
        this.#disableInteraction();   
    }

    allowInteraction() {         
        this.#buttons.forEach(button => {
            button.style.display = "block";
        })
    }

    #onClickModeButton(event) {
        assert(this.#buttons.includes(event.target));

        const button = event.target;        
        this.#turn.reset(button.numPlayers);        
        this.#disableInteraction();
        this.#onGameCallBack();
    }

    #disableInteraction() {   
        this.#buttons.forEach(button => {
            button.style.display = "none";
        })
    }
}