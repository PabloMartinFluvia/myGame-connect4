import { PlayerVisitor, RandomPlayer, UserPlayer } from "../models/Players.mjs";
import { GameError } from "../models/Error.mjs";

import { TurnView } from "./TurnView.mjs";
import { BoardView } from "./BoardView.mjs";

import { assert } from "../utils/assert.mjs";
import { Game } from "../models/Game.mjs";

export class GameView extends PlayerVisitor {
       
    #game;
    #errorInfo;
    #turnView;
    #boardView; 
    #gameObserver;   

    constructor(game) {
        super();
        assert(game instanceof Game);

        this.#game = game;
        this.#setupErrorInfo();
        this.#turnView = new TurnView(game.getTurn());
        this.#boardView = new BoardView(game.getBoard());
        this.#boardView.registerBoardObserver(this);        
    }

    #setupErrorInfo() {
        this.#errorInfo = document.getElementById("errorInfo");
    }

    registerGameObserver(gameObserver) {
        this.#gameObserver = gameObserver;
    }

    
    interact() {        
        this.#turnView.interact();
        this.#boardView.show();
        this.#play();                
    }

    #play() {
        this.#turnView.show();        
        this.#getActivePlayer().accept(this);
    }

    #getActivePlayer() {
        return this.#game.getActivePlayer();
    }
    
    visitUserPlayer(userPlayer) {
        this.#boardView.interact();
    }

    onColumnSelected(column) {
        assert(this.#getActivePlayer() instanceof UserPlayer);        

        const error = this.#getActivePlayer().getErrorColumn(column);
        this.#showError(error);
        if (error.isNull()) {
            this.#boardView.disableInteraction();
            this.#dropToken(column);
        }
    }

    #showError(error) {
        assert(error instanceof GameError);        

        const errorTextNode = this.#errorInfo.firstChild;
        if (errorTextNode !== null) {
            this.#errorInfo.removeChild(errorTextNode);
        }

        if (error === GameError.COMPLETED_COLUMN) {
            this.#errorInfo.appendChild(document.createTextNode("Column is Full"));
        } else if (!error.isNull()) {
            throw new Error("unexcpected error on column validation");    
        }
    }

    visitRandomPlayer(randomPlayer) {
        assert(randomPlayer instanceof RandomPlayer);

        const column = randomPlayer.getRandomColumn();
        setTimeout(() => { this.#dropToken(column); }, 400);        
    }

    #dropToken(column) {
        assert(!this.#errorInfo.hasChildNodes());

        this.#getActivePlayer().dropToken(column);
        this.#boardView.show();         
        if (!this.#game.isFinished()) {
            this.#game.next();
            this.#play();
        } else {
            this.#turnView.showResult();
            this.#gameObserver.onEndGame(); 
        }
    }
}


