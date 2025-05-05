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
        this.#turnView.readGameMode(this.#game.getBoard());
        this.#boardView.write();
        let finished;
        do {
            this.#turnView.play();
            this.#boardView.write();
            finished = this.#game.isFinished();
            if (!finished) {
                this.#game.changeTurn();                
            }
        } while (!finished);
        this.#turnView.writeResult();
    }
    
}