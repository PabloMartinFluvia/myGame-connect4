import { Turn } from "../models/Turn.mjs";
import {PlayerVisitor, Player, UserPlayer, RandomPlayer} from "../models/Players.mjs";
import { Error } from "../models/Error.mjs";

import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

import { ClosedInterval } from "../utils/ClosedInterval.mjs";
import { assert } from "../utils/assert.mjs";

class ErrorView {

    static #MESSAGES = [
        Message.INVALID_GAME_MODE,
        Message.INVALID_COLUMN,
        Message.COMPLETED_COLUMN];

    #error;

    constructor(error) {
        assert(error instanceof Error);
        assert(error.isNull() ||
            new ClosedInterval(0, ErrorView.#MESSAGES.length - 1).isIncluded(error.getCode()));

        this.#error = error;
    }

    writeln() {
        if (!this.#error.isNull()) {
            ErrorView.#MESSAGES[this.#error.getCode()].writeln();
        }
    }
}

class PlayerView extends PlayerVisitor {

    #player;

    constructor(player) {
        assert(player instanceof Player);
        super();

        this.#player = player;
    }

    play() {
        Message.TURN.write();
        consoleMPDS.writeln(this.#player.getName());
        const column = this.#player.accept(this);
        this.#player.dropToken(column);
    }

    visitUserPlayer(userPlayer) {
        assert(userPlayer instanceof UserPlayer);

        let column;
        let error;
        do {
            column = consoleMPDS.readNumber(Message.ENTER_COLUMN_TO_DROP.toString()) - 1;
            error = userPlayer.getErrorColumn(column);
            new ErrorView(error).writeln();
        } while (!error.isNull());
        return column;
    }

    visitRandomPlayer(randomPlayer) {
        assert(randomPlayer instanceof RandomPlayer);

        const column = randomPlayer.getRandomColumn();
        const msg = Message.RANDOM_COLUMN.toString().replace(`#value`, column + 1);
        consoleMPDS.writeln(msg);
        return column;
    }

    writeWin() {
        let message = Message.PLAYER_WIN.toString();
        message = message.replace(`#winner`, this.#player.getName());
        consoleMPDS.writeln(message);
    }
}

export class TurnView {

    #turn;

    constructor(turn) {
        assert(turn instanceof Turn);

        this.#turn = turn;
    }

    play() {
        new PlayerView(this.#turn.getActivePlayer()).play();
        this.#turn.next();
    }

    readGameMode() {
        let numUsers;
        let error;
        do {
            numUsers = consoleMPDS.readNumber(Message.GAME_MODE.toString());
            error = Turn.getErrorGameMode(numUsers);
            new ErrorView(error).writeln();
        } while (!error.isNull());
        this.#turn.reset(numUsers);
    }

    writeResult() {
        if (this.#turn.isWinner()) {
            new PlayerView(this.#turn.getActivePlayer()).writeWin();            
        } else {
            Message.PLAYERS_TIED.writeln();
        }
    }

}