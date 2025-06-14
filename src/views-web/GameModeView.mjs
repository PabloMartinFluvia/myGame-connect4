import { assert } from "../utils/assert.mjs";
import { ButtonsView } from "./ButtonsView.mjs";

export class GameModeView extends ButtonsView{    

    constructor(onClickCallback) {        
        assert(typeof onClickCallback === "function");
        
        super();               
        this.#initButtons(onClickCallback);        
    }

    #initButtons(onClickCallback) {                
        const onClickButton = event => {      
            this._disableInteraction();
            onClickCallback(event.target.numUsers);
        }
        const MODE_OPTIONS = ["RANDOM vs RANDOM", "JUGADOR vs RANDOM", "JUGADOR vs JUGADOR"];        
        for (let numUsers = MODE_OPTIONS.length - 1; numUsers >= 0; numUsers--) {
            this._initButton(MODE_OPTIONS[numUsers], onClickButton, {numUsers: numUsers});                                 
        }   
        this._disableInteraction();       
    } 
}