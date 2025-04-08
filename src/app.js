const { Console } = require("console-mpds");

const consoleMPDS = new Console();

new Connect4().play();

function Connect4() {
    setup();

    this.game = new Game();
    this.gameView = new GameView(this.game);
    this.resumeDialog = new YesNoDialog();

    function setup() {
        Messages();
        initConnect4Prototype();
        initYesNoDialogProtoype();
        initGameViewPrototype();
        initGamePrototype();
        initTurnPrototype();
        initPlayerViewPrototype();
        initLimitedIntDialogPrototype();
        initIntervalClosedPrototype();
        initPlayerPrototype();
        initBoardPrototype();
        initDirectionPrototype();
        initCoordinatePrototype();
        initBoardViewProtoype();
    }
}
function initConnect4Prototype() {
    Connect4.prototype.play = function () {
        let resume;
        do {
            this.gameView.play();
            this.resumeDialog.ask();
            resume = this.resumeDialog.isAffirmative();
            if (resume) {
                this.game.reset();
            }
        } while (resume);
    }
}

function GameView(game) {
    assert(game ?? false);

    this.game = game;
    this.playerView = new PlayerView(game);
    this.boardView = new BoardView(game);
}
function initGameViewPrototype() {
    GameView.prototype.play = function () {
        consoleMPDS.writeln(Messages.TITLE);
        this.boardView.show();
        let end;
        do {
            this.playerView.readToken();
            this.boardView.show();
            end = this.playerView.isWinner() || isBoardFull(this);
            if (!end) {
                this.game.changeTurn();
            }
        } while (!end);
        this.playerView.end();

        function isBoardFull({ game }) {
            for (let column = 0; column < game.getColumnDimension(); column++) {
                if (!game.isColumnFull(column)) {
                    return false;
                }
            }
            return true;
        };
    };
}

function PlayerView(game) {
    assert(game ?? false);
    this.game = game;
    this.columnDialog = new LimitedIntDialog(game.getColumnDimension());
}
function initPlayerViewPrototype() {
    PlayerView.prototype.readToken = function () {
        const player = getPlayer(this);
        let column;
        let error;
        do {             
            column = this.columnDialog.ask(
                `${Messages.READ_TOKEN_PREFIX}${player}${Messages.READ_TOKEN_SUFIX}`) - 1;
            error = this.game.isColumnFull(column);
            if (error) {
                consoleMPDS.writeln(Messages.ERROR_READ_TOKEN);
            }
        } while (error);
        player.placeToken(column);
    };

    function getPlayer({game}) {
        return game.getPlayer();
    }

    PlayerView.prototype.isWinner = function () {
        return getPlayer(this).isWinner();
    }

    PlayerView.prototype.end = function () {
        if (this.isWinner()) {            
            consoleMPDS.writeln(
                `${Messages.WIN_PREFIX}${getPlayer(this)}${Messages.WIN_SUFIX}`);
        } else {
            consoleMPDS.writeln(Messages.TIE);
        }        
    }
}

function BoardView(game) {
    assert(game ?? false);

    this.board = game.getBoard();
    this.VERTICAL = "|";
    this.HORIZONTAL = "_";
    this.CELL_CHARS = 4;
}
function initBoardViewProtoype() {
    BoardView.prototype.show = function () {
        const columns = this.board.getColumnDimension();
        showTopLine(columns, this);        
        for (let row = 0; row < this.board.getRowDimension(); row++) {
            const ROW_CORNER = this.VERTICAL;
            let rowLine = "";
            for (let column = 0; column < columns; column++) {
                const token = this.board.getToken(new Coordinate(row, column));
                const CELL = ROW_CORNER.concat(this.HORIZONTAL)
                    .concat(`${token ?? this.HORIZONTAL}`)
                    .concat(this.HORIZONTAL);
                rowLine = rowLine.concat(CELL);                
            }
            consoleMPDS.writeln(`${rowLine.concat(ROW_CORNER)}`);
        }

        function showTopLine(columns, { HORIZONTAL, CELL_CHARS }) {
            const TOP_CORNER = " ";
            const CELL = TOP_CORNER.concat(HORIZONTAL.repeat(CELL_CHARS - 1));
            const topLine = CELL.repeat(columns)
                .concat(TOP_CORNER);
            consoleMPDS.writeln(topLine);
        }
    }
}



function Game() {
    const TOKENS = ['X', 'O'];
    this.board = new Board(TOKENS);
    this.turn = new Turn(TOKENS.map(token => new Player(token, this.board)));

}
function initGamePrototype() {
    Game.prototype.reset = function () {
        this.turn.reset();
        this.board.reset();
    };

    Game.prototype.changeTurn = function () {
        this.turn.change();
    };

    Game.prototype.getPlayer = function () {
        return this.turn.getPlayer();
    };

    Game.prototype.isColumnFull = function (column) {
        return this.board.isColumnFull(column);
    };

    Game.prototype.getColumnDimension = function () {
        return this.board.getColumnDimension();
    };

    Game.prototype.getBoard = function () {
        return this.board;
    };    
}

function Turn(players) {
    assert(Array.isArray(players));
    assert(players.length > 0);

    this.players = players;
    this.index = 0;
}
function initTurnPrototype() {    
    consoleMPDS.writeln(1 % 0);  
    Turn.prototype.getPlayer = function () {
        return this.players[this.index];
    };

    Turn.prototype.change = function () {
        this.index = (this.index + 1) % this.players.length;
    }; 

    Turn.prototype.reset = function () {
        this.index = 0;
    };
}

function Player(token, board) {
    assert(board ?? false);
    this.token = token;
    this.board = board;
}
function initPlayerPrototype() {
    Player.prototype.placeToken = function (column) {
        this.board.placeToken(this.token, column);
    };

    Player.prototype.isWinner = function () {
        return this.board.isWinner(this.token);
    };

    Player.prototype.toString = function () {
        return this.token;;
    };
}

function Board(tokens) {
    assert(Array.isArray(tokens));
    this.tokens = tokens;
    this.tokensCoordinates = this.tokens.map(anyValue => []);    
    this.WIN_COUNT = 4;
}
function initBoardPrototype() {
    Board.prototype.isColumnFull = function (column) {
        assert(new IntervalClosed(Coordinate.COLUMN_DIMENSION - 1).includes(column));
        const TOP_ROW = 0;
        const topCoordinate = new Coordinate(TOP_ROW, column);
        return !isEmpty(topCoordinate, this);
    };

    function isEmpty(coordinate, board) {
        return board.getToken(coordinate) === undefined;
    }

    Board.prototype.placeToken = function (token, column) {
        assert(this.tokens.includes(token));
        assert(!this.isColumnFull(column));
        const BOTTON_ROW = Coordinate.ROW_DIMENSION - 1;
        let placedCoordinate = new Coordinate(BOTTON_ROW, column);
        while (!isEmpty(placedCoordinate, this)) {
            const toTop = new Direction(-1, 0);
            placedCoordinate = placedCoordinate.shift(toTop);
        }
        const index = this.tokens.indexOf(token);
        this.tokensCoordinates[index].push(placedCoordinate);
    };

    Board.prototype.isWinner = function (token) {
        assert(this.tokens.includes(token));
        const coordinates = this.tokensCoordinates[this.tokens.indexOf(token)];
        const lastPlaced = coordinates[coordinates.length - 1];
        for (let direction of getDirections()) {
            let candidates = lastPlaced.getRange(direction, this.WIN_COUNT);            
            const LAST_PLACED_POSITIONS_TO_CHECK = this.WIN_COUNT;
            for (let count = 1; count <= LAST_PLACED_POSITIONS_TO_CHECK; count++) {
                if (isConnect4(candidates, token, this)) {
                    return true;
                } else {
                    candidates.forEach((coordinate, index, array) =>
                        array[index] = coordinate.shift(direction.inverse()))
                }
            }
        }
        return false;

        function isConnect4(candidates, token, board) {
            assert(candidates.length === board.WIN_COUNT);
            return candidates.every(coordinate =>
                isInBoard(coordinate, board)
                && token === board.getToken(coordinate));
        }

        function getDirections() {
            const toTop = new Direction(-1, 0);
            const toRight = new Direction(0, 1);
            const toTopRight = new Direction(-1, 1);
            const toDownRight = new Direction(1, 1);
            return [toTop, toRight, toTopRight, toDownRight];
        }
    };

    function isInBoard(coordinate, board) {
        assert(coordinate ?? false);
        return new IntervalClosed(Coordinate.ROW_DIMENSION - 1).includes(coordinate.getRow())
            && new IntervalClosed(Coordinate.COLUMN_DIMENSION - 1).includes(coordinate.getColumn());
    }

    Board.prototype.getToken = function (coordinate) {
        assert(isInBoard(coordinate, this));
        for (let i = 0; i < this.tokens.length; i++) {
            if (this.tokensCoordinates[i].some(placed => placed.equals(coordinate))) {
                return this.tokens[i];
            }
        }
        return undefined;
    };
    
    Board.prototype.getRowDimension = function () {
        return Coordinate.ROW_DIMENSION;
    };

    Board.prototype.getColumnDimension = function () {
        return Coordinate.COLUMN_DIMENSION;
    };

    Board.prototype.reset = function () {
        this.tokensCoordinates = this.tokens.map(anyValue => []);
    };
}

function Direction(rowShift, columnShift) {
    assert(Number.isInteger(rowShift));
    assert(Number.isInteger(columnShift));
    this.rowShift = rowShift;
    this.columnShift = columnShift;
}
function initDirectionPrototype() {
    Direction.prototype.inverse = function () {
        return new Direction(-this.rowShift, -this.columnShift);
    };

    Direction.prototype.getRowShift = function () {
        return this.rowShift;
    };

    Direction.prototype.getColumnShift = function () {
        return this.columnShift;
    };
}

function Coordinate(row, column) {
    assert(Number.isInteger(row));
    assert(Number.isInteger(column));
    this.row = row;
    this.column = column;
}
function initCoordinatePrototype() {
    Coordinate.ROW_DIMENSION = 6;
    Coordinate.COLUMN_DIMENSION = 7;

    Coordinate.prototype.shift = function (direction) {
        assert(direction ?? false);
        const row = this.row + direction.getRowShift();
        const column = this.column + direction.getColumnShift();
        return new Coordinate(row, column);
    };

    Coordinate.prototype.getRange = function (direction, count) {
        const range = [this];
        for (let i = 1; i < count; i++) {
            const next = range[i - 1].shift(direction);
            range.push(next);
        }
        return range;
    };

    Coordinate.prototype.equals = function (other) {
        assert(other ?? false);
        return this.row === other.getRow() && this.column === other.getColumn();
    };

    Coordinate.prototype.getRow = function () {
        return this.row;
    };

    Coordinate.prototype.getColumn = function () {
        return this.column;
    };
}






function Messages() {
    Messages.TITLE = "--------- CONNECT4 ----------";
    Messages.READ_TOKEN_PREFIX = `Player `;
    Messages.READ_TOKEN_SUFIX = ` choose column:`;
    Messages.ERROR_READ_TOKEN = `Wrong column: it's full.`;
    Messages.WIN_PREFIX = `Player `;
    Messages.WIN_SUFIX = ` won!!! ;-)`
    Messages.TIE = `You have tied!!!`;
    Messages.ERROR_VALUE_PREFIX = `Wrong value: it must be `;
    Messages.YES = 'y';
    Messages.NO = 'n';
    Messages.RESUME_QUESTION = `Do you want to continue? (${Messages.YES}/${Messages.NO}):`;
    Messages.ERROR_RESUME_ANSWER = `Please, answer "${Messages.YES}" or "${Messages.NO}"`;    
}

function YesNoDialog() {    
    this.answer = undefined;
}
function initYesNoDialogProtoype() {
    YesNoDialog.prototype.ask = function () {
        let error = false;
        do {
            this.answer = consoleMPDS.readString(Messages.RESUME_QUESTION);
            error = !this.isAffirmative() && !isNegative(this);
            if (error) {
                consoleMPDS.writeln(Messages.ERROR_RESUME_ANSWER);
            }
        } while (error);

        function isNegative({answer}) {
            return answer === Messages.NO;
        }
    };

    YesNoDialog.prototype.isAffirmative = function () {
        return this.answer === Messages.YES;
    };
}

function LimitedIntDialog(max, min = 1) {
    assert(Number.isInteger(max));
    assert(Number.isInteger(min));

    this.limits = new IntervalClosed(max, min);
}
function initLimitedIntDialogPrototype() {
    LimitedIntDialog.prototype.ask = function (msg) {
        let answer;
        let error;
        do {
            answer = consoleMPDS.readNumber(msg);
            error = !this.limits.includes(answer);
            if (error) {
                consoleMPDS.writeln(`${Messages.ERROR_VALUE_PREFIX}${this.limits}`)
            }
        } while (error);
        return answer;
    };
}

function IntervalClosed(max, min = 0) {
    assert(typeof max === "number");
    assert(typeof min === "number");
    assert(max >= min);
    this.max = max;
    this.min = min;
}
function initIntervalClosedPrototype() {
    IntervalClosed.prototype.includes = function (value) {
        assert(typeof value === "number");
        return this.min <= value && value <= this.max;
    };

    IntervalClosed.prototype.toString = function () {
        return `[${this.min}, ${this.max}]`;
    };
}

function assert(condition, msg) {
    if (!condition) {
        if (msg !== undefined) {
            console.log(`Assertion Error: ${msg}`);
        }
        const assertionError = "I'm CONSTANT !!!";
        assertionError = "assert stop execution";
    }
}
