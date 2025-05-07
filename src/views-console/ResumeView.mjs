import { Board } from "../models/Board.mjs";
import { Turn } from "../models/Turn.mjs";

import { Message } from "./Message.mjs";

import { YesNoDialog } from "../utils/YesNoConsoleDialog.mjs";
import { assert } from "../utils/assert.mjs";

export class ResumeView {

    #yesNoDialog;
    #board;
    #turn;

    constructor(board, turn) {
        assert(board instanceof Board);
        assert(turn instanceof Turn);

        this.#yesNoDialog = new YesNoDialog();
        this.#board = board;
        this.#turn = turn;
    }

    read() {
        this.#yesNoDialog.read(Message.RESUME.toString());
        if (this.isResume()) {
            this.#board.reset();
            this.#turn.reset();
        }
    }

    isResume() {
        return this.#yesNoDialog.isAffirmative();
    }
}