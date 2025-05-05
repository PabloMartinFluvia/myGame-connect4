export class Error {
    static INVALID_GAME_MODE = new Error(0);
    static INVALID_COLUMN = new Error(1);
    static COMPLETED_COLUMN= new Error(2);
    static NULL = new Error(-1);

    #code;

    constructor(code) {
        this.#code = code;
    }

    isNull() {
        return this === Error.NULL;
    }

    getCode() {
        return this.#code;
    }
}