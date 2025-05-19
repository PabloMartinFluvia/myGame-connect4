import { Game } from "../models/Game.mjs";

import { assert } from "../utils/assert.mjs";

class OptionsView {

    #game;
    #buttons;
    
    constructor(game) {
        assert(game instanceof Game);

        this.#game = game;
        this.#buttons = [];        
        this._setupButtons();
        this._styleButtons();        
    }

    _setupButtons() {assert(false, 'abstract');}

    _createButton() {
        return document.createElement('button');
    }

    _addButton(button) {
        this.#buttons.push(button);
    }

    _styleButtons() {
        this.#buttons.forEach(button => {
            button.className = "optionButton";
        });
    }
    
    _addEventListeners() {
        const onClickListener = this._createOnClickListener();
        this._getButtons().forEach(modeButton => {
            modeButton.addEventListener("click", onClickListener);
        });
    }
    
    _createOnClickListener() {assert(false, 'abstract')}

    interact() {
        const optionsInfo = this._getOptionsInfo();
        this.#buttons.forEach(button => {
            optionsInfo.appendChild(button);
        });
    }

    _disableInteraction() {
        const optionsInfo = this._getOptionsInfo();
        const activeOptions = optionsInfo.childNodes;
        this.#buttons.forEach(button => {
            if (Array.from(activeOptions).includes(button)) {
                optionsInfo.removeChild(button);
            }
        });
    }

    _getGame() {
        return this.#game;
    }

    _getButtons() {
        return this.#buttons;
    }

    _getOptionsInfo() {
        return document.getElementById("optionsInfo");
    }
}

export class GameModeView extends OptionsView{
   
    #gameModeObserver;    

    constructor(game) {
        super(game);       
        this._addEventListeners();      
    }

    _setupButtons() {        
        const MODE_OPTIONS = ["RANDOM vs RANDOM", "JUGADOR vs RANDOM", "JUGADOR vs JUGADOR"];
        for (let numPlayers = MODE_OPTIONS.length - 1; numPlayers >=0 ; numPlayers--) {
            const modeButton = this._createButton();
            modeButton.numPlayers = numPlayers;
            modeButton.appendChild(document.createTextNode(MODE_OPTIONS[numPlayers]));
            this._addButton(modeButton);
        }
    }

    registerGameModeObserver(gameModeSelectedObserver) {
        this.#gameModeObserver = gameModeSelectedObserver;
    }

    _createOnClickListener() {
        return this.#onClickModeButton.bind(this);
    }

    #onClickModeButton(event) {
        const numPlayers = event.target.numPlayers;
        this._getGame().setNumPlayers(numPlayers);
        this._disableInteraction();
        this.#gameModeObserver.onGameModeSelected();
    }
}

export class ResumeView extends OptionsView{    
    
    #resumeObserver;

    constructor(game) {
        super(game); 
        this._addEventListeners();
    }

    _setupButtons() {
        const resumeButton = this._createButton();
        resumeButton.appendChild(document.createTextNode("NUEVA PARTIDA"));
        this._addButton(resumeButton);
    }

    registerResumeObserver(resumeObserver) {
        this.#resumeObserver = resumeObserver;
    }

    _createOnClickListener() {
        return this.#onClickResumeButton.bind(this);
    }

    #onClickResumeButton(event) {
        this._getGame().reset();
        this._disableInteraction();
        this.#resumeObserver.onResume();
    }    
}

