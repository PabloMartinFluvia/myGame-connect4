

import { Turn } from "../models/Turn.mjs"

import { assert } from "../utils/assert.mjs";
import { LogicEvents } from "./LogicEvents.mjs";
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
        this.#boardView = new BoardView(this.#board);
        this.#turnView = new TurnView(this.#turn);
        this.#gameModeView = new GameModeView(this.#turn);
        this.#resumeView = new ResumeView(this.#turn, this.#board);

        document.addEventListener(LogicEvents.INITIAL.type, this.#onInitialState.bind(this));
        document.addEventListener(LogicEvents.IN_GAME.type, this.#onInGameState.bind(this)); 
        document.addEventListener(LogicEvents.COLUMN_SELECTED.type, this.#onColumnSelected.bind(this));  
        document.addEventListener(LogicEvents.OUT_GAME.type, this.#onOutGameState.bind(this));           
    }

    play() {
        document.dispatchEvent(LogicEvents.INITIAL);
    }

    // Start Use Case

    #onInitialState(event) {        
        this.#turnView.hidde();
        this.#gameModeView.allowInteraction();    
        this.#boardView.show();     
    }

    // Drop Token Use Case

    #onInGameState(event) {
        this.#turnView.show();
        this.#turn.getActivePlayer().accept(this);
    }

    visitUserPlayer(userPlayer) {  
        assert(userPlayer instanceof UserPlayer);

        this.#boardView.allowInteraction(); 
    }

    #onColumnSelected(event) {         
        const column = event.target.column;
        const error = this.#turn.getActivePlayer().getErrorColumn(column);
        this.#turnView.showError(error);
        if (error.isNull()) {
            this.#dropToken(column);
        } else {            
            document.dispatchEvent(LogicEvents.IN_GAME); 
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
            document.dispatchEvent(LogicEvents.IN_GAME);
        } else {
            this.#turnView.show();
            document.dispatchEvent(LogicEvents.OUT_GAME);
        }
    }

    // Resume Use Case
    #onOutGameState (event) {
        this.#resumeView.allowInteraction();
    }

}

assert.ENABLED = true; // enabled for dev
new Connect4().play();
