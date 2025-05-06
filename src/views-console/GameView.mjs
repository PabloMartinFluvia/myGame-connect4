import { Game } from '../models/Game.mjs'

import { BoardView } from './BoardView.mjs';
import { TurnView } from './TurnView.mjs'
import { Message } from './Message.mjs';

import { assert } from "../utils/assert.mjs";

export class GameView {

    #game
    #boardView;
    #turnView;

    constructor(game) {
        assert(game instanceof Game);

        this.#game = game;
        this.#boardView = new BoardView(this.#game.getBoard());
        this.#turnView = new TurnView(this.#game.getTurn());
    }

    play() {
        Message.TITLE.writeln();
        this.#turnView.readGameMode();
        this.#boardView.write();        
        do {
            this.#turnView.play();
            this.#boardView.write();                     
        } while (!this.#game.isFinished());
        this.#turnView.writeResult();
    }
    
}