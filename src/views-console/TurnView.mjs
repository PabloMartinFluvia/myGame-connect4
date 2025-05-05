import { Turn } from "../models/Turn.mjs";

import { SettingView } from "./SettingView.mjs";
import { Message } from "./Message.mjs";

import { assert } from "../utils/assert.mjs";

export class TurnView {

    #turn;
    #playersViews;

    constructor(turn) {
        assert(turn instanceof Turn);

        this.#turn = turn;
        this.#playersViews = undefined;
    }

    #getPlayerView() {
        return  this.#playersViews[this.#turn.getIndex()];
    }

    play() {
        this.#getPlayerView().dropToken();        
    }

    readGameMode() {
        this.#playersViews = new SettingView(this.#turn).readGameMode();
    }

    writeResult() {
        if (this.#turn.isWinner()) {
            this.#getPlayerView().writeWin();
        } else {
            Message.PLAYERS_TIED.writeln();
        }
    }

}