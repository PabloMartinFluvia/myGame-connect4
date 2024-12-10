const { Console } = require("console-mpds");

const consoleMPDS = new Console();

new Connect4().play();

function Connect4() {
    initPrototypes();

    this.game = new Game();
    this.gameView = new GameView(this.game);
    this.resumeDialog = new YesNoDialog("Do you want to continue?");

    function initPrototypes() {
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

function YesNoDialog(question) {
    assert(typeof question === "string");
    assert(question.endsWith('?'));

    this.question = question;
    this.answer = undefined;
    this.YES = "y";
    this.NO = "n";
}
function initYesNoDialogProtoype() {
    YesNoDialog.prototype.ask = function () {
        let error = false;
        do {
            this.answer = consoleMPDS.readString(`${this.question} (${this.YES}/${this.NO}):`);
            error = !this.isAffirmative() && !isNegative(this);
            if (error) {
                consoleMPDS.writeln(`Please, answer "${this.YES}" or "${this.NO}"`);
            }
        } while (error);

        function isNegative({ answer, NO }) {
            return answer === NO;
        }
    };

    YesNoDialog.prototype.isAffirmative = function () {
        return this.answer === this.YES;
    };
}

function GameView(game) {
    assert(game ?? false);

    this.game = game;
    this.playerView = new PlayerView(game);
    this.boardView = new BoardView(game);
}
function initGameViewPrototype() {
    GameView.prototype.play = function () {
        consoleMPDS.writeln("--------- CONNECT4 ----------\n");
        this.boardView.show();
        let end;
        do {
            const column = askColumn(this);
            this.game.placeToken(column);
            this.boardView.show();
            end = this.game.isWinner() || isBoardFull(this);
            if (!end) {
                this.game.changeTurn();
            }
        } while (!end);
        showEnd(this);

        function askColumn({ game, playerView }) {
            let column;
            let error;
            do {
                column = playerView.askColumn();
                error = game.isColumnFull(column);
                if (error) {
                    consoleMPDS.writeln("Wrong column: it's full.");
                }
            } while (error);
            return column;
        };

        function isBoardFull({ game }) {
            for (let column = 0; column < game.countColumns(); column++) {
                if (!game.isColumnFull(column)) {
                    return false;
                }
            }
            return true;
        };

        function showEnd({ game, playerView }) {
            if (game.isWinner()) {
                playerView.win();
            } else {
                consoleMPDS.writeln("You have tied!!!");
            }
        }
    };
}

function Game() {
    const TOKENS = ['X', 'O'];
    this.board = new Board(TOKENS);
    const players = TOKENS.map(token => new Player(token, this.board));
    this.turn = new Turn(players);

}
function initGamePrototype() {
    Game.prototype.countColumns = function () {
        return this.board.countColumns();
    };

    Game.prototype.isColumnFull = function (column) {
        return this.board.isColumnFull(column);
    };

    Game.prototype.placeToken = function (column) {
        return this.turn.getPlayer().placeToken(column);
    };

    Game.prototype.isWinner = function () {
        return this.turn.getPlayer().isWinner();
    };

    Game.prototype.changeTurn = function () {
        this.turn.change();
    };

    Game.prototype.getTurn = function () {
        return this.turn;
    };

    Game.prototype.getBoard = function () {
        return this.board;
    };

    Game.prototype.reset = function () {
        this.turn.reset();
        this.board.reset();
    };
}

function Turn(players) {
    assert(Array.isArray(players));
    assert(players.length > 0);

    this.players = players;
    this.index = 0;
}
function initTurnPrototype() {
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

function PlayerView(game) {
    assert(game ?? false);
    this.turn = game.getTurn();
    this.columnDialog = new LimitedIntDialog('column', game.countColumns());
}
function initPlayerViewPrototype() {
    PlayerView.prototype.askColumn = function () {
        const player = this.turn.getPlayer();
        this.columnDialog.setActionTitle(`Player ${player.getToken()} choose`);
        return this.columnDialog.ask() - 1;
    };

    PlayerView.prototype.win = function () {
        const player = this.turn.getPlayer();
        consoleMPDS.writeln(`Player ${player.getToken()} won!!! ;-)`);
    }
}

function LimitedIntDialog(subject = "value", max, min = 1, actionTitle = "Introduce") {
    assert(typeof subject === "string");
    assert(typeof actionTitle === "string");
    assert(Number.isInteger(max));
    assert(Number.isInteger(min));

    this.subject = subject;
    this.actionTitle = actionTitle;
    this.limits = new IntervalClosed(max, min);
}
function initLimitedIntDialogPrototype() { 
    LimitedIntDialog.prototype.ask = function () {
        let answer;
        let error;
        do {
            answer = consoleMPDS.readNumber(`${this.actionTitle} ${this.subject}:`);
            error = !this.limits.includes(answer);
            if (error) {
                consoleMPDS.writeln(`Wrong ${this.subject}: it must be ${this.limits}`)
            }
        } while (error);
        return answer;
    };

    LimitedIntDialog.prototype.setActionTitle = function (actionTitle) {
        assert(typeof actionTitle === "string");
        this.actionTitle = actionTitle;
    };
}

/**
 * Interval: [ max, min ] 
 */
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

function Player(token, board) {
    assert(typeof token === "string");
    assert(token.length === 1);
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

    Player.prototype.getToken = function () {
        return this.token;
    };
}

function Board(tokens) {
    assert(Array.isArray(tokens));   
    this.tokens = tokens;
    this.tokensCoordinates = this.tokens.map(token => []);
    this.ROWS = 6;
    this.COLUMNS = 7;
    this.WIN_COUNT = 4;
}
function initBoardPrototype() {
    Board.prototype.isColumnFull = function (column) {
        assert(new IntervalClosed(this.COLUMNS - 1).includes(column));
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
        const BOTTON_ROW = this.ROWS - 1;
        let placedCoordinate = new Coordinate(BOTTON_ROW, column);
        while (!isEmpty(placedCoordinate, this)) {
            const vertical = new Direction(1, 0);
            placedCoordinate = placedCoordinate.shift(vertical.inverse());
        }
        const index = this.tokens.indexOf(token);
        this.tokensCoordinates[index].push(placedCoordinate);
    };

    Board.prototype.isWinner = function (token) {
        assert(this.tokens.includes(token));
        const coordinates = this.tokensCoordinates[this.tokens.indexOf(token)];
        const lastPlaced = coordinates[coordinates.length - 1];
        for (let direction of getDirections()) {            
            let candidates = initCandidates(lastPlaced, direction, this.WIN_COUNT);
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
            return candidates.every(coordinate =>
                                        isInBoard(coordinate, board) 
                                        && token === board.getToken(coordinate)) 
                    && candidates.length >= board.WIN_COUNT;
        }

        function initCandidates(initial, direction, length) {
            const candidates = [initial];
            for (let i = 1; i < length; i++) {
                const next = candidates[i - 1].shift(direction);
                candidates.push(next);
            }
            return candidates;
        }

        function getDirections() {
            const vertical = new Direction(1, 0);
            const horizontal = new Direction(0, 1);
            const diagonal = new Direction(1, 1);
            const inverseDiagonal = new Direction(1, -1);
            return [vertical, horizontal, diagonal, inverseDiagonal];
        }
    };

    function isInBoard(coordinate, board) {
        assert(coordinate ?? false);
        return new IntervalClosed(board.ROWS - 1).includes(coordinate.getRow())
            && new IntervalClosed(board.COLUMNS - 1).includes(coordinate.getColumn());
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

    Board.prototype.countRows = function () {
        return this.ROWS;
    };

    Board.prototype.countColumns = function () {
        return this.COLUMNS;
    };

    Board.prototype.reset = function () {
        this.tokensCoordinates = this.tokens.map(token => []);
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
    Coordinate.prototype.shift = function (direction) {
        assert(direction ?? false);
        const row = this.row + direction.getRowShift();
        const column = this.column + direction.getColumnShift();
        return new Coordinate(row, column);
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

function BoardView(game) {
    assert(game ?? false);

    this.board = game.getBoard();
    this.VERTICAL = "|";
    this.HORIZONTAL = "_";
    this.CHARS_IN_CELL_PATTERN = 4;
}
function initBoardViewProtoype() {
    BoardView.prototype.show = function () {
        const columns = this.board.countColumns();
        showTopLine(columns, this);
        for (let row = 0; row < this.board.countRows(); row++) {
            for (let column = 0; column < columns; column++) {
                consoleMPDS.write(`${this.VERTICAL}${this.HORIZONTAL}`)
                let charsPrinted = 2;
                const token = this.board.getToken(new Coordinate(row, column));
                if (token !== undefined) {
                    writeTokenChar(token);
                    charsPrinted++;
                }
                consoleMPDS.write(this.HORIZONTAL
                    .repeat(this.CHARS_IN_CELL_PATTERN - charsPrinted));
            }
            consoleMPDS.writeln(this.VERTICAL);
        }

        function writeTokenChar(token) {
            assert(typeof token === "string" && token.length === 1);
            consoleMPDS.write(`${token}`);
        }

        function showTopLine(columns, { HORIZONTAL, CHARS_IN_CELL_PATTERN }) {
            const TOP_CORNER = " ";
            const topLine = TOP_CORNER
                .concat(HORIZONTAL.repeat(CHARS_IN_CELL_PATTERN - 1))
                .repeat(columns)
                .concat(TOP_CORNER);
            consoleMPDS.writeln(topLine);
        }
    }
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
