import { RandomPlayer } from "../models/RandomPlayer.mjs";

import { PlayerView } from "./PlayerView.mjs";
import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";

export class RandomPlayerView extends PlayerView{

    /*
    constructor(player) {
        assert(player instanceof RandomPlayer)
        super(player);
    }

    readColumn() {        
        let column = this.#getRandomPlayer().getRandomColumn();
        const msg = Message.RANDOM_COLUMN.toString().replace(`#value`, column + 1);
        consoleMPDS.writeln(msg);
        return column;
    }

    #getRandomPlayer() {
        return this._getPlayer();
    }
    */
}