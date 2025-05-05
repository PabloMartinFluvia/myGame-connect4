import { Player } from "../models/Player.mjs";

import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";

export class PlayerView {    
    #player

    constructor(player) {
        assert(player instanceof Player);

        this.#player = player;
    }

    dropToken() {
        Message.TURN.write();
        consoleMPDS.writeln(this.#player.toString());
        let column = this.readColumn();        
        this.#player.dropToken(column);
    }

    readColumn() {assert(false, "abstract");}

    _getPlayer() {
        return this.#player;
    }

    writeWin() {
        let message = Message.PLAYER_WIN.toString();
        message = message.replace(`#winner`, this.#player.toString());
        consoleMPDS.writeln(message);
    }
}