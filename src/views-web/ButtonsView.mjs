import { assert } from "../utils/assert.mjs";

export class ButtonsView {

    #buttons;    

    constructor() {
        this.#buttons = [];        
    }

    _initButton(text, onClickButton, customProperties) {
        assert(typeof onClickButton === "function");

        const button = document.createElement("button");        
        // TODO: style button   
        button.appendChild(document.createTextNode(text));
        button.addEventListener("click", onClickButton); 
        if (customProperties !== undefined) {
            Object.assign(button, customProperties);
        }
        document.getElementById("buttons-container").appendChild(button);  
        this.#buttons.push(button);      
    }

    allowInteraction() {
        this.#buttons.forEach(button => {
            button.style.display = "block";
        })
    }

    _disableInteraction() {
        this.#buttons.forEach(button => {
            button.style.display = "none";
        })
    }
}