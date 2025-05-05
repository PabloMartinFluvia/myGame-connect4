import { Turn } from "../models/Turn.mjs";

import { UserView } from "./UserView.mjs";
import { RandomView } from "./RandomView.mjs";
import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { ClosedInterval } from "../utils/ClosedInterval.mjs";
import { assert } from "../utils/assert.mjs";

export class SettingView {
            
    #turn;

    constructor(turn) {
        assert(turn instanceof Turn)
        
        this.#turn = turn;
    }

    readGameMode() {
        const numUsers = this.#getNumUsers();
        const playersViews = [];
        for (let i = 0; i < numUsers; i++) {
            playersViews.push(new UserView(this.#turn.getPlayer(i)));
        }
        for (let i = numUsers; i < Turn.NUMBER_PLAYERS; i++) {
            playersViews.push(new RandomView(this.#turn.getPlayer(i)));
        }
        return playersViews; 
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