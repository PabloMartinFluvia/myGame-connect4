import { Board } from "../models/Board.mjs";
import { Turn } from "../models/Turn.mjs";

import { BoardView } from "./BoardView.mjs";
import { TurnView } from "./TurnView.mjs";
import { ResumeView } from "./ResumeView.mjs";
import { Message } from "./Message.mjs";

import { assert } from "../utils/assert.mjs";

class Connect4 {

    #board;
    #turn;
    #boardView;
    #turnView;

    constructor() {
        this.#board = new Board();
        this.#turn = new Turn(this.#board);
        this.#boardView = new BoardView(this.#board);
        this.#turnView = new TurnView(this.#turn);
    }

    playGames() {
        const resumeView = new ResumeView(this.#board, this.#turn);
        do {
            Message.TITLE.writeln();
            this.#turnView.readGameMode();
            this.#boardView.write();
            do {
                this.#turnView.play();
                this.#boardView.write();
            } while (!this.#turn.isLast());
            this.#turnView.writeResult();
            resumeView.read();
        } while (resumeView.isResume());
    }
    
}

//assert.ENABLED = false; // In production add line. In develop comment linte.
new Connect4().playGames();

