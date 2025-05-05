import { Turn } from "../models/Turn.mjs";

import { SettingView } from "./SettingView.mjs";
import { Message } from "./Message.mjs";

import { assert } from "../utils/assert.mjs";
import { UserPlayer } from "../models/UserPlayer.mjs";
import { UserPlayerView } from "./UserPlayerView.mjs";
import { RandomPlayer } from "../models/RandomPlayer.mjs";
import { RandomPlayerView } from "./RandomPlayerView.mjs";

export class TurnView {

    #turn;

    constructor(turn) {
        assert(turn instanceof Turn);

        this.#turn = turn;
    }

    #getPlayerView() {
        const player = this.#turn.getActivePlayer();
        if (player instanceof UserPlayer) {
            return new UserPlayerView(player);
        } else if (player instanceof RandomPlayer) {
            return new RandomPlayerView(player);
        }
        return null;        
    }

    play() {
        this.#getPlayerView().dropToken();        
    }

    readGameMode(board) {
        new SettingView(this.#turn).readGameMode(board);
    }

    writeResult() {
        if (this.#turn.isWinner()) {
            this.#getPlayerView().writeWin();
        } else {
            Message.PLAYERS_TIED.writeln();
        }
    }

}