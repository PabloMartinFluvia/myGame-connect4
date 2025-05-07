import { consoleMPDS } from "./ConsoleMPDS.mjs";

import { assert } from "./assert.mjs";

export class YesNoDialog {

    static #AFFIRMATIVE = `y`;
    static #NEGATIVE = `n`;    
    #answer;

    read(question) {
        assert(typeof question === 'string');

        let ok;
        do {
            const SUFFIX = `? (` +
                YesNoDialog.#AFFIRMATIVE + `/` +
                YesNoDialog.#NEGATIVE + `): `;
            this.#answer = consoleMPDS.readString(question + SUFFIX);
            ok = this.isAffirmative() || this.#isNegative();
            if (!ok) {
                const ERROR = `The value must be ${YesNoDialog.#AFFIRMATIVE} or ${YesNoDialog.#NEGATIVE}`;
                consoleMPDS.writeln(ERROR);
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