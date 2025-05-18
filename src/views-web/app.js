import { Board } from '../models/Board.mjs';
import {Turn} from '../models/Turn.mjs';

import { StartView } from './StartView.mjs';
import { DropTokenView } from './DropTokenView.mjs';
import { ResumeView } from './ResumeView.mjs';

import { assert } from '../utils/assert.mjs';



class Connect4 {

    #board;
    #turn;   

    #startView; 
    #dropTokenView;
    #resumeView;

    constructor() {
        this.#board = new Board();
        this.#turn = new Turn(this.#board);   

        this.#startView = new StartView(this.#turn, this.#board);
        this.#dropTokenView = new DropTokenView(this.#turn, this.#board);       
        this.#resumeView = new ResumeView(this.#turn, this.#board);

        this.#startView.addObserver(this.#dropTokenView);
        this.#dropTokenView.addObserver(this.#resumeView);
        this.#resumeView.addObserver(this.#startView);
    }

    playGames() {        
        this.#startView.enable();
    }
}


function main() {
    assert.ENABLED = true; // enabled for dev
    new Connect4().playGames();
}
main();

