import { Turn } from "../models/Turn.mjs";
import { Coordinate } from "../models/Coordinate.mjs";

import { consoleMPDS } from "./Console.mjs";


export class Message {
    static TITLE = new Message(`--- CONNECT 4 ---`);
    static GAME_MODE = new Message(`Enter number of players:`);
    static INVALID_GAME_MODE = new Message(`Invalid number of players!!! Values [0-${Turn.NUMBER_PLAYERS}]`);
    static HORIZONTAL_LINE = new Message(`-`);
    static VERTICAL_LINE = new Message(`|`);
    static ESPACE = new Message(` `);
    static TURN = new Message(`Turn: `);
    static ENTER_COLUMN_TO_DROP = new Message(`Enter a column to drop a token: `);
    static INVALID_COLUMN = new Message(`Invalid columnn!!! Values [1-${Coordinate.NUMBER_COLUMNS}]`);
    static COMPLETED_COLUMN = new Message(`Invalid column!!! It's completed`);
    static RANDOM_COLUMN = new Message(`Token randomly put in column #value`);
    static PLAYER_WIN = new Message(`#winner WIN!!! : -)`);
    static PLAYERS_TIED = new Message(`TIED!!!`);
    static RESUME = new Message(`Do you want to continue`);

    #msg;

    constructor(msg) {
        this.#msg = msg;
    }

    write() {
        consoleMPDS.write(this.#msg);
    }

    writeln() {
        consoleMPDS.writeln(this.#msg);
    }

    toString() {
        return this.#msg;
    }

}