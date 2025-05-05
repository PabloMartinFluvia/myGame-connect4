import { Turn } from "../models/Turn.mjs";
import { UserPlayer } from "../models/UserPlayer.mjs";
import { RandomPlayer } from "../models/RandomPlayer.mjs";
import { Color } from "../models/Color.mjs";

import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { ClosedInterval } from "../utils/ClosedInterval.mjs";
import { assert } from "../utils/assert.mjs";
import { Board } from "../models/Board.mjs";

export class SettingView {
            
    #turn;

    constructor(turn) {
        assert(turn instanceof Turn)
        
        this.#turn = turn;
    }

    readGameMode(board) {
        const numUsers = this.#getNumUsers();
        const players = [];
        for (let i = 0; i < Turn.NUMBER_PLAYERS; i++) {  
            if (i < numUsers) {
                players[i] = new UserPlayer(Color.get(i), board);
            } else {                
                players[i] = new RandomPlayer(Color.get(i), board);
            }
        }
        this.#turn.setPlayers(players);
    }

    #getNumUsers() {
        let numUsers;
        let valid;
        do {
            numUsers = consoleMPDS.readNumber(Message.GAME_MODE.toString());
            valid = new ClosedInterval(0, Turn.NUMBER_PLAYERS).isIncluded(numUsers);
            if (!valid) {
                Message.INVALID_GAME_MODE.writeln();
            }
        } while (!valid);
        return numUsers;
    }
}