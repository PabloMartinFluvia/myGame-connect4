import { Board } from "./models/Board.mjs";
import { Turn } from "./models/Turn.mjs";

import { BoardView } from "./views-console/BoardView.mjs";
import { TurnView } from "./views-console/TurnView.mjs";
import { ResumeView } from "./views-console/ResumeView.mjs";
import { Message } from "./views-console/Message.mjs";

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

new Connect4().playGames();

