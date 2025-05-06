import { Board } from "./models/Board.mjs";
import { Turn } from "./models/Turn.mjs";

import { BoardView } from "./views-console/BoardView.mjs";
import { TurnView } from "./views-console/TurnView.mjs";
import { YesNoDialog } from "./views-console/YesNoDialog.mjs";
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
        let resume;
        do {
            this.#playGame();
            resume = this.#isResumed();
            if (resume) {
                this.#board.reset();
                this.#turn.reset();
            }
        } while (resume);
    }

    #playGame() {
        Message.TITLE.writeln();
        this.#turnView.readGameMode();
        this.#boardView.write();
        do {
            this.#turnView.play();
            this.#boardView.write();
        } while (!this.#turn.isLast());
        this.#turnView.writeResult();
    }

    #isResumed() {
        const yesNoDialog = new YesNoDialog();
        yesNoDialog.read(Message.RESUME.toString());
        return yesNoDialog.isAffirmative();
    }

}

new Connect4().playGames();

