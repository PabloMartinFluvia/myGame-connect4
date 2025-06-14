

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
        this.#boardView = new BoardView(this.#board, this.#dropToken.bind(this));
        this.#turnView = new TurnView(this.#turn);     

        this.#gameModeView = new GameModeView(this.#playGame.bind(this));
        this.#resumeView = new ResumeView(this.#onResumeGame.bind(this)); 
        
        this.#onStart();
    }


    // Start Use Case

    #onStart() {          
        this.#turnView.hidde();
        this.#boardView.show();  
        this.#gameModeView.allowInteraction();               
    }

    #playGame(numUsers) {
        this.#turn.reset(numUsers);
        this.#onGame();
    }

    // Drop Token Use Case

    #onGame() {
        this.#turnView.show();
        this.#turn.getActivePlayer().accept(this);
    }

    visitRandomPlayer(randomPlayer) { 
        assert(randomPlayer instanceof RandomPlayer);

        const column = randomPlayer.getRandomColumn();
        setTimeout(() => { this.#dropToken(column); }, 400);
    }

    visitUserPlayer(userPlayer) {  
        assert(userPlayer instanceof UserPlayer);

        this.#boardView.allowInteraction();         
    }

    #dropToken(column) {
        this.#turn.getActivePlayer().dropToken(column);
        this.#boardView.show(); 
        if (!this.#turn.isLast()) {     
            this.#turn.next();       
            this.#onGame();
        } else {
            this.#turnView.showResult();
            this.#onOutGame();
        }
    }

    // Resume Use Case
    #onOutGame () {
        this.#resumeView.allowInteraction();
    }

    #onResumeGame() {
        this.#turn.reset();
        this.#board.reset();
        this.#onStart();
    }

}

assert.ENABLED = true; // enabled for dev
const app = new Connect4();

