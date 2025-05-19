import { GameView } from "./GameView.mjs";
import { GameModeView, ResumeView } from "./OptionsViews.mjs";

import { Game } from "../models/Game.mjs";

import { assert } from "../utils/assert.mjs";

class Connect4 {

    #game;
    #gameModeView;
    #gameView;
    #resumeView;

    constructor() {
        this.#game = new Game();
        this.#gameModeView = new GameModeView(this.#game);
        this.#gameView = new GameView(this.#game);
        this.#resumeView = new ResumeView(this.#game);
        this.#addObservers();  
    }

    #addObservers() {
        this.#gameModeView.registerGameModeObserver(this);
        this.#gameView.registerGameObserver(this);
        this.#resumeView.registerResumeObserver(this);
    }  

    play() {
        this.#gameModeView.interact();
    } 

    onGameModeSelected() {
        console.log('game mode selected')
        this.#gameView.interact();
    }

    onEndGame() {
        console.log('game ended');
        this.#resumeView.interact();
    }

    onResume() {      
        this.play();
    }

    
}

assert.ENABLED = true; // enabled for dev
new Connect4().play();
