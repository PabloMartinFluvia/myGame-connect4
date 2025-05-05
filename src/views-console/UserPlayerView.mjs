import { UserPlayer } from "../models/UserPlayer.mjs";

import { PlayerView } from "./PlayerView.mjs";
import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";
import { ErrorView } from "./ErrorView.mjs";

export class UserPlayerView extends PlayerView {

    constructor(player) {
        assert(player instanceof UserPlayer)
        super(player);
    }

    readColumn() {
        let column;
        let error;
        do {            
            column = consoleMPDS.readNumber(Message.ENTER_COLUMN_TO_DROP.toString()) - 1;            
            error = this.#getUserPlayer().getColumnError(column);
            if (!error.isNull()) {
                new ErrorView(error).writeln();
            }
        } while (!error.isNull());
        return column;
    }

    #getUserPlayer() {
        return this._getPlayer();
    }
    
}