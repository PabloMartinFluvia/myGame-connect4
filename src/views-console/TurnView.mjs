import { Turn } from "../models/Turn.mjs";
import { UserPlayer } from "../models/UserPlayer.mjs";
import { RandomPlayer } from "../models/RandomPlayer.mjs";
import { PlayerVisitor } from "../models/PlayerVisitor.mjs";
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

export class TurnView extends PlayerVisitor {

    #turn;

    constructor(turn) {
        assert(turn instanceof Turn);
        super();

        this.#turn = turn;
    }

    play() {
        Message.TURN.write();
        const player = this.#turn.getActivePlayer();
        consoleMPDS.writeln(player.getName());
        const column = player.accept(this);
        player.dropToken(column);
        this.#turn.next();
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

    readGameMode() {
        let numUsers;
        let error;
        do {
            numUsers = consoleMPDS.readNumber(Message.GAME_MODE.toString());
            error = this.#turn.getErrorGameMode(numUsers);
            new ErrorView(error).writeln();
        } while (!error.isNull());
        this.#turn.configGameMode(numUsers);
    }

    writeResult() {
        if (this.#turn.isWinner()) {
            let message = Message.PLAYER_WIN.toString();
            message = message.replace(`#winner`, this.#turn.getActivePlayer().getName());
            consoleMPDS.writeln(message);
        } else {
            Message.PLAYERS_TIED.writeln();
        }
    }

}