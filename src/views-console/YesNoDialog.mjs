import { consoleMPDS } from "./Console.mjs";

import { assert } from "../utils/assert.mjs";

export class YesNoDialog {

    static #AFFIRMATIVE = `y`;
    static #NEGATIVE = `n`;
    static #SUFFIX = `? (` +
        YesNoDialog.#AFFIRMATIVE + `/` +
        YesNoDialog.#NEGATIVE + `): `;
    static #ERROR = `The value must be ${YesNoDialog.#AFFIRMATIVE} or ${YesNoDialog.#NEGATIVE}`;
    #answer;

    read(question) {
        assert(question ?? false);

        let ok;
        do {
            this.#answer = consoleMPDS.readString(question + YesNoDialog.#SUFFIX);
            ok = this.isAffirmative() || this.#isNegative();
            if (!ok) {
                consoleMPDS.writeln(YesNoDialog.#ERROR);
            }
        } while (!ok);
    }

    isAffirmative() {
        return this.#getAnswer() === YesNoDialog.#AFFIRMATIVE;
    }

    #isNegative() {
        return this.#getAnswer() === YesNoDialog.#NEGATIVE;
    }

    #getAnswer() {
        return this.#answer.toLowerCase()[0];
    }
}