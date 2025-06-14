import { assert } from "../utils/assert.mjs";
import { ButtonsView } from "./ButtonsView.mjs";

export class ResumeView extends ButtonsView{

    constructor(onClickCallback) {
        assert(typeof onClickCallback === "function");

        super();
        this.#initButton(onClickCallback);
    }

    #initButton(onClickCallback) {
        const onClickButton = event => {            
            this._disableInteraction();
            onClickCallback();
        }
        this._initButton("NUEVA PARTIDA", onClickButton); 
        this._disableInteraction();
    }
}