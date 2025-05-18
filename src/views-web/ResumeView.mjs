import { UseCaseView } from "./UseCaseView.mjs";

export class ResumeView extends UseCaseView{

    #resumeGameElement;

    constructor(turn, board) {
        super(turn, board);
        this.#resumeGameElement = document.getElementById("resumeGame");   
        this.#configListeners();  
    }

    #configListeners() {
        const buttonElement = document.getElementById("resumeButton");        
        buttonElement.addEventListener('click', this.#onClickResumeButton.bind(this));        
    }

    #onClickResumeButton(event) {
        const resultInfoElement = document.getElementById("resultInfo");
        const resultTextNode = resultInfoElement.firstChild;
        if (resultTextNode) {
            resultInfoElement.removeChild(resultTextNode);
        }
        this._getTurn().reset();
        this._getBoard().reset();
        this._disable();
        this._enableNexts();
    }

    enable() {
        super.enable();
        this.#resumeGameElement.style.display = 'initial';
    }

    _disable() {
        super._disable();
        this.#resumeGameElement.style.display = 'none';
    }
}