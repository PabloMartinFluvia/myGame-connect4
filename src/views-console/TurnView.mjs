import { Turn } from "../models/Turn.mjs";
import { UserPlayer } from "../models/UserPlayer.mjs";
import { RandomPlayer } from "../models/RandomPlayer.mjs";

import { UserPlayerView } from "./UserPlayerView.mjs";
import { RandomPlayerView } from "./RandomPlayerView.mjs";
import { ErrorView } from "./ErrorView.mjs";
import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";

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

    readGameMode() {        
        let numUsers;
        let error;
        do {
            numUsers = consoleMPDS.readNumber(Message.GAME_MODE.toString());            
            error = this.#turn.getGameModeError(numUsers);
            if (!error.isNull()) {
                new ErrorView(error).writeln();
            }
        } while (!error.isNull());
        this.#turn.configGameMode(numUsers);
    }

    writeResult() {
        if (this.#turn.isWinner()) {
            this.#getPlayerView().writeWin();
        } else {
            Message.PLAYERS_TIED.writeln();
        }
    }

}