

import { Turn } from "../models/Turn.mjs"

import { assert } from "../utils/assert.mjs";
import { GameModeView } from "./GameModeView.mjs";
import { Board } from "../models/Board.mjs";
import { ResumeView } from "./ResumeView.mjs";
import { BoardView } from "./BoardView.mjs";
import { TurnView } from "./TurnView.mjs";
import { PlayerVisitor, RandomPlayer, UserPlayer } from "../models/Players.mjs";

class Connect4 extends PlayerVisitor{
    
    #board;
    #turn;
    #boardView;
    #turnView;
    #gameModeView;
    #resumeView;

    constructor() {
        super();
        
        this.#board = new Board();
        this.#turn = new Turn(this.#board);
        this.#boardView = new BoardView(this.#board, this.#onColumnSelected.bind(this));
        this.#turnView = new TurnView(this.#turn);
        this.#gameModeView = new GameModeView(this.#turn, this.#onGame.bind(this));
        this.#resumeView = new ResumeView(this.#turn, this.#board, this.#onStart.bind(this)); 
        
        this.#onStart();
    }

    /*
    Start -> Drop Token -> Resume -> Start <<---- Ciclo

    StartView when finish:
        this.#turnView.show();
        this.#turn.getActivePlayer().accept(dropTokenView);
    
    DropTokenView when finish:
        this.#resumeView.allowInteraction();

    ResumeView when finish:
        this.#turnView.hidde();
        this.#gameModeView.allowInteraction();    
        this.#boardView.show(); 
    */

    // Start Use Case

    #onStart() {          
        this.#turnView.hidde();
        this.#gameModeView.allowInteraction();    
        this.#boardView.show();     
    }

    // Drop Token Use Case

    #onGame() {
        this.#turnView.show();
        this.#turn.getActivePlayer().accept(this);
    }

    visitUserPlayer(userPlayer) {  
        assert(userPlayer instanceof UserPlayer);

        this.#boardView.allowInteraction(); 
    }

    #onColumnSelected(column) {                 
        const error = this.#turn.getActivePlayer().getErrorColumn(column);
        this.#turnView.showError(error);
        if (error.isNull()) {
            this.#dropToken(column);
        } else {            
            this.#onGame();
        }
    }

    visitRandomPlayer(randomPlayer) { 
        assert(randomPlayer instanceof RandomPlayer);

        const column = randomPlayer.getRandomColumn();
        setTimeout(() => { this.#dropToken(column); }, 400);
    }

    #dropToken(column) {
        this.#turn.getActivePlayer().dropToken(column);
        this.#boardView.show(); 
        if (!this.#turn.isLast()) {     
            this.#turn.next();       
            this.#onGame();
        } else {
            this.#turnView.show();
            this.#onOutGame();
        }
    }

    // Resume Use Case
    #onOutGame (event) {
        this.#resumeView.allowInteraction();
    }

}

assert.ENABLED = true; // enabled for dev
const app = new Connect4();
