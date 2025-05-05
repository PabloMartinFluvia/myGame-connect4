import { Game } from "./models/Game.mjs";

import { GameView } from "./views-console/GameView.mjs";
import { YesNoDialog } from "./views-console/YesNoDialog.mjs";
import { Message } from "./views-console/Message.mjs";

class Connect4 {

    #game;
    #gameView;   

    constructor() {
        this.#game = new Game();
        this.#gameView = new GameView(this.#game);       
    }

    playGames() {
        let resume;
        do {
            this.#gameView.play();
            resume = this.#isResumed();
            if(resume) {
                this.#game.reset();
            }
        } while (resume);
    }

    #isResumed() {
        const yesNoDialog = new YesNoDialog();
        yesNoDialog.read(Message.RESUME.toString());        
        return yesNoDialog.isAffirmative();
    }    

}

new Connect4().playGames();

