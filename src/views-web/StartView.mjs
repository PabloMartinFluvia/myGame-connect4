import { UseCaseView } from "./UseCaseView.mjs";

export class StartView extends UseCaseView {
    
    #gameModeElement;

    constructor(turn, board) {
        super(turn, board);   
        this.#gameModeElement = document.getElementById("gameMode");   
        /*
         si se llama des del constructor de la clase padre:
        this se està comportando como un objeto UseCaseView
        -> quien és this dentro del mètodo? -> enlace implícito 
        -> si el mètodo onClickModeButton se deja privado no se reconoce
         */
        this.#configListeners();    
    }

    #configListeners() {
        const triggerElementsId = ["randomRandomButton", "userRandomButton", "userUserButton"];
        for (let numUsers = 0; numUsers < triggerElementsId.length; numUsers++) {
            const buttonElement = document.getElementById(triggerElementsId[numUsers]);
            buttonElement.setAttribute('numUsers', numUsers);  
            buttonElement.addEventListener('click', this.#onClickModeButton.bind(this));
        }
    }

    #onClickModeButton(event) {
        if (this._isEnabled()) {
            const numUsers = Number.parseInt(event.target.getAttribute('numUsers'));            
            this._getTurn().reset(numUsers);   
            this._disable();         
            this._enableNexts();
        }
    }

    enable() {
        super.enable();
        this.#gameModeElement.style.display = 'initial';
    }

    _disable() {
        super._disable();
        this.#gameModeElement.style.display = 'none';
    }

}