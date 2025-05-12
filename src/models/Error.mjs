export class GameError {
    static INVALID_GAME_MODE = new GameError(0);
    static INVALID_COLUMN = new GameError(1);
    static COMPLETED_COLUMN= new GameError(2);
    static NULL = new GameError(-1);

    #code;

    constructor(code) {
        this.#code = code;
    }

    isNull() {
        return this === GameError.NULL;
    }

    getCode() {
        return this.#code;
    }
}