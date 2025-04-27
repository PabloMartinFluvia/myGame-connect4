const { Console } = require("console-mpds");

const consoleMPDS = new Console();

class ClosedInterval {

    #min;
    #max;

    constructor(min, max) {
        assert(typeof max === "number");
        assert(typeof min === "number");
        assert(max >= min);

        this.#min = min;
        this.#max = max;
    }

    isIncluded(value) {
        assert(typeof value === "number");

        return this.#min <= value && value <= this.#max;
    }

}

class Color {

    static RED = new Color(`Red`);
    static YELLOW = new Color(`Yellow`);
    static NULL = new Color(` `);
    #string;

    constructor(string) {
        this.#string = string;
    }

    static get(ordinal) {
        assert(typeof ordinal === "number");
        assert(new ClosedInterval(0, Color.#values.length - 1).isIncluded(ordinal));

        return Color.#values[ordinal];
    }

    static get #values() {
        return [Color.RED, Color.YELLOW, Color.NULL];
    }

    get isNull() {
        return this === Color.NULL;
    }

    toString() {
        return this.#string;
    }

}

class Coordinate {

    static NUMBER_ROWS = 6;
    static NUMBER_COLUMNS = 7;
    #row;
    #column;

    constructor(row, column) {
        assert(Number.isInteger(row) && Number.isInteger(column));

        this.#row = row;
        this.#column = column;
    }

    static #isRowValid(row) {        
        return Number.isInteger(row) 
                && new ClosedInterval(0, Coordinate.NUMBER_ROWS - 1).isIncluded(row);
    }

    static isColumnValid(column) {
        return Number.isInteger(column) 
                && new ClosedInterval(0, Coordinate.NUMBER_COLUMNS - 1).isIncluded(column);
    }

    get isValid() {
        return Coordinate.#isRowValid(this.#row) && Coordinate.isColumnValid(this.#column);
    }

    shifted(coordinate) {
        assert(coordinate instanceof Coordinate);

        return new Coordinate(this.#row + coordinate.#row, this.#column + coordinate.#column);
    }

    get opposited() {
        return new Coordinate(-1 * this.#row, -1 * this.#column);
    }

    get row() {
        return this.#row;
    }

    get column() {
        return this.#column;
    }
}

class Vector {
    static NORTH = new Vector(1, 0); 
    static EAST = new Vector(0, 1);
    static NORTH_EAST = new Vector(1, 1);
    static SOUTH_EAST = new Vector(-1, 1);

    #coordinate;

    constructor(row, column) {
        this.#coordinate = new Coordinate(row, column);
    }

    get opposited() {
        const oppositedCoord = this.#coordinate.opposited;
        return new Vector(oppositedCoord.row, oppositedCoord.column);        
    }

    toCoordinate() {
        return this.#coordinate;
    }

}

class Line {
    static WIN_LENGTH = 4;
    #origin
    #vector    

    constructor(origin, vector) {
        assert(origin instanceof Coordinate);
        assert(vector instanceof Vector);

        this.#origin = origin;
        this.#vector = vector;
    }

    get shiftedToOpposite() {        
        const shiftedOrigin = this.#origin.shifted(this.#vector.opposited.toCoordinate());
        return new Line(shiftedOrigin, this.#vector);
    }

    get coordinates() {
        let coordinates = [this.#origin];        
        for (let i = 1; i < Line.WIN_LENGTH; i++) {
            coordinates[i] = coordinates[i - 1].shifted(this.#vector.toCoordinate());
        }
        return coordinates;
    }

    get isValid() {
        return this.coordinates.every(coordinate => coordinate.isValid);
    }
    
}

class Board {
    #colors;
    #lastDrop;

    constructor() {
        this.#colors = [];
        for (let i = 0; i < Coordinate.NUMBER_ROWS; i++) {
            this.#colors[i] = [];
        }
        this.reset();
    }

    reset() {
        for (let i = 0; i < Coordinate.NUMBER_ROWS; i++) {            
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                this.#colors[i][j] = Color.NULL;
            }
        }
        this.#lastDrop = undefined;
    }

    dropToken(column, color) {
        assert(!this.isComplete(column));
        assert(color instanceof Color);

        this.#lastDrop = new Coordinate(0, column);
        while (!this.#isEmpty(this.#lastDrop)) {
            this.#lastDrop = this.#lastDrop.shifted(Vector.NORTH.toCoordinate());
        }
        this.#colors[this.#lastDrop.row][this.#lastDrop.column] = color;
    }

    isComplete(column) {
        if (column !== undefined) {
            assert(Coordinate.isColumnValid(column));

            return !this.#isEmpty(new Coordinate(Coordinate.NUMBER_ROWS - 1, column));
        }
        for (let i = 0; i < Coordinate.NUMBER_COLUMNS; i++) {
            if (!this.isComplete(i)) {
                return false;
            }
        }
        return true;
    }

    #isEmpty(coordinate) {
        return this.getColor(coordinate) === Color.NULL;     
    }

    getColor(coordinate) {
        assert(coordinate instanceof Coordinate);
        assert(coordinate.isValid);

        return this.#colors[coordinate.row][coordinate.column];
    }

    isWinner(color) {
        assert(color instanceof Color);
        assert(!color.isNull);
        assert(color === this.getColor(this.#lastDrop));

        for (let vector of [Vector.NORTH, Vector.NORTH_EAST, Vector.EAST, Vector.SOUTH_EAST]) {               
            let line = new Line(this.#lastDrop, vector);
            for (let i = 0; i < Line.WIN_LENGTH; i++) {                
                if (this.#isConnect4(line)) {
                    return true;
                }
                line = line.shiftedToOpposite;
            }
        }
        return false;
    }
    
    #isConnect4(line) {
        assert(line instanceof Line);

        if (!line.isValid) {
            return false;
        }
        const coordinates = line.coordinates;
        for (let i = 1; i < coordinates.length; i++) {
            const color = this.getColor(coordinates[i - 1]);
            if (this.getColor(coordinates[i]) !== color || color.isNull) {
                return false;
            }
        }
        return true;              
    }
    
}

class Player {

    #color;
    #board;

    constructor(color, board) {
        assert(color instanceof Color);
        assert(board instanceof Board);

        this.#color = color;
        this.#board = board;
    }    

    dropToken(column) {
        this.#board.dropToken(column, this.#color);
    }

    isComplete(column) {
        return this.#board.isComplete(column);
    }

    get isWinner() {
        return this.#board.isWinner(this.#color);
    }

    toString() {
        return this.#color.toString();
    }

}

class Turn {

    static #NUMBER_PLAYERS = 2;
    #players;
    #activePlayer;

    constructor(board) {
        this.#players = [];
        for (let i = 0; i < Turn.#NUMBER_PLAYERS; i++) {
            this.#players[i] = new Player(Color.get(i), board);
        }
        this.reset();
    }

    reset() {        
        this.#activePlayer = 0;
    }

    get isWinner() {
        return this.currentPlayer.isWinner;
    }

    change() {
        this.#activePlayer = (this.#activePlayer + 1) % Turn.#NUMBER_PLAYERS;
    }

    get currentPlayer() {
        return this.#players[this.#activePlayer];
    }

}

class Game {

    #board;
    #turn;    

    constructor() {
        this.#board = new Board();
        this.#turn = new Turn(this.#board);
    }

    get isFinished() {
        return this.#board.isComplete() || this.#turn.isWinner;
    }

    changeTurn() {
        this.#turn.change();
    }

    reset() {
        this.#board.reset();
        this.#turn.reset();
    }

    get board() {
        return this.#board;
    }

    get turn() {
        return this.#turn;
    }
}

class Message {
    static TITLE = new Message(`--- CONNECT 4 ---`);
    static HORIZONTAL_LINE = new Message(`-`);
    static VERTICAL_LINE = new Message(`|`);
    static TURN = new Message(`Turn: `);
    static ENTER_COLUMN_TO_DROP = new Message(`Enter a column to drop a token: `);
    static INVALID_COLUMN = new Message(`Invalid columnn!!! Values [1-${Coordinate.NUMBER_COLUMNS}]`);
    static COMPLETED_COLUMN = new Message(`Invalid column!!! It's completed`);
    static PLAYER_WIN = new Message(`#winner WIN!!! : -)`);
    static PLAYERS_TIED = new Message(`TIED!!!`);
    static RESUME = new Message(`Do you want to continue`);

    #string;

    constructor(string) {
        this.#string = string;
    }

    write() {
        consoleMPDS.write(this.#string);
    }

    writeln() {
        consoleMPDS.writeln(this.#string);
    }

    toString() {
        return this.#string;
    }

}

class PlayerView {    
    #player

    constructor(player) {
        assert(player instanceof Player);

        this.#player = player;
    }

    dropToken() {
        let column;
        let valid;
        do {
            Message.TURN.write();
            consoleMPDS.writeln(this.#player.toString());
            column = consoleMPDS.readNumber(Message.ENTER_COLUMN_TO_DROP.toString()) - 1;
            valid = Coordinate.isColumnValid(column);
            if (!valid) {
                Message.INVALID_COLUMN.writeln();
            } else {
                valid = !this.#player.isComplete(column);
                if (!valid) {
                    Message.COMPLETED_COLUMN.writeln();
                }
            }
        } while (!valid);
        this.#player.dropToken(column);
    }


    writeWin() {
        let message = Message.PLAYER_WIN.toString();
        message = message.replace(`#winner`, this.#player.toString());
        consoleMPDS.writeln(message);
    }
}

class TurnView {

    #turn;

    constructor(turn) {
        assert(turn instanceof Turn);

        this.#turn = turn;
    }

    play() {
        this.#playerView.dropToken();        
    }

    writeResult() {
        if (this.#turn.isWinner) {
            this.#playerView.writeWin();
        } else {
            Message.PLAYERS_TIED.writeln();
        }
    }

    get #playerView() {
        return  new PlayerView(this.#turn.currentPlayer);
    }

}

class ColorView {

    #COLOR_LENGTH;

    constructor(colorLength) {
        assert(Number.isInteger(colorLength));    

        this.#COLOR_LENGTH = colorLength;
    }

    write(color) {
        assert(color instanceof Color);
        assert(color.toString().length > 0);

        let msg = "";
        for (let i = 0; i < this.#COLOR_LENGTH; i++) {
            if (this.#isMiddle(i)) {
                msg += color.toString()[0];
            } else {
                msg += " ";
            }
        }
        consoleMPDS.write(msg);
    }

    #isMiddle(index) {
        assert(Number.isInteger(index));     

        return Number.parseInt(this.#COLOR_LENGTH / 2) === index;
    }
}

class BoardView {

    static #COLUMN_LENGTH = 4;
    #board;
    #colorView;

    constructor(board) {
        assert(board instanceof Board);

        this.#board = board;
        this.#colorView = new ColorView(BoardView.#COLUMN_LENGTH - 1);
    }

    write() {
        BoardView.#writeHorizontal();
        for (let i = Coordinate.NUMBER_ROWS - 1; i >= 0; i--) {
            Message.VERTICAL_LINE.write();
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                const color = this.#board.getColor(new Coordinate(i, j));
                this.#colorView.write(color);
                Message.VERTICAL_LINE.write();
            }
            consoleMPDS.writeln();
        }
        BoardView.#writeHorizontal();
    }

    static #writeHorizontal() {
        for (let i = 0; i < BoardView.#COLUMN_LENGTH * Coordinate.NUMBER_COLUMNS; i++) {
            Message.HORIZONTAL_LINE.write();
        }
        Message.HORIZONTAL_LINE.writeln();
    }

}

class GameView {

    #game
    #boardView;
    #turnView;

    constructor(game) {
        assert(game instanceof Game);

        this.#game = game;
        this.#boardView = new BoardView(this.#game.board);
        this.#turnView = new TurnView(this.#game.turn);
    }

    play() {
        Message.TITLE.writeln();
        this.#boardView.write();
        let finished;
        do {
            this.#turnView.play();
            this.#boardView.write();
            finished = this.#game.isFinished;
            if (!finished) {
                this.#game.changeTurn();                
            }
        } while (!finished);
        this.#turnView.writeResult();
    }
    
}

class YesNoDialog {

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
            ok = this.isAffirmative || this.#isNegative;
            if (!ok) {
                consoleMPDS.writeln(YesNoDialog.#ERROR);
            }
        } while (!ok);
    }

    get isAffirmative() {
        return this.#getAnswer() === YesNoDialog.#AFFIRMATIVE;
    }

    get #isNegative() {
        return this.#getAnswer() === YesNoDialog.#NEGATIVE;
    }

    #getAnswer() {
        return this.#answer.toLowerCase()[0];
    }
}

class Connect4 {

    #game;
    #gameView;   

    constructor() {
        this.#game = new Game();
        this.#gameView = new GameView(this.#game);       
    }

    playGames() {
        let resume;
        do {
            this.#gameView.play();
            resume = this.#isResumed();
            if(resume) {
                this.#game.reset();
            }
        } while (resume);
    }

    #isResumed() {
        const yesNoDialog = new YesNoDialog();
        yesNoDialog.read(Message.RESUME.toString());        
        return yesNoDialog.isAffirmative;
    }    

}

new Connect4().playGames();

function assert(condition, msg) {
    if (!condition) {
        if (msg !== undefined) {
            console.log(`Assertion Error: ${msg}`);
        }
        const assertionError = "I'm CONSTANT !!!";
        assertionError = "assert stop execution";
    }
}