const { Console } = require("console-mpds");

const consoleMPDS = new Console();

new Connect4().play();

function Connect4() {
    initEnums();
    initPrototypes();

    this.game = new Game();
    this.gameView = new GameView(this.game);
    this.resumeDialog = new YesNoDialog("Do you want to continue?");

    function initEnums() {
        Color();
        Object.freeze(Color);
        Direction();
        Object.freeze(Direction);
    }

    function initPrototypes() {
        initConnect4Prototype();
        initYesNoDialogProtoype();
        initGameViewPrototype();
        initPlayerViewPrototype();
        initLimitedIntDialogProtorype();
        initClosedIntervalPrototype();
        initGamePrototype();
        initTurnPrototype();
        initBoardPrototype();
        initCoordinatePrototype();
        initBoardViewProtoype();
    }
}
function initConnect4Prototype() { // YesNoDialog
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

    this.YES = "y";
    this.NO = "n";
    this.question = question;
    this.answer = undefined;
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

        function isNegative({answer, NO}) {
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
    this.boardView = new BoardView(game);
    this.playerView = new PlayerView(game);
}    
function initGameViewPrototype() {  // Game, PlayerView
    GameView.prototype.play = function() {
        consoleMPDS.writeln("--------- CONNECT4 ----------\n");
        this.boardView.show();
        let end;
        do {
            const column = askColumn(this);
            this.game.placePlayerToken(column);
            this.boardView.show();
            end = this.game.isPlayerWinner() || isBoardFull(this);
            if (!end) {
                this.game.changeTurn();
            }
        } while (!end);
        showEnd(this);

        function askColumn({game, playerView}) {
            let column;
            let error;
            do {
                column = playerView.askColumn();
                error = game.isColumnFull(column);
                if (error) {
                    playerView.showErrorFullColumn();
                }
            } while (error);
            return column;
        };

        function isBoardFull({game}) {
            for (let column = 0; column < game.getColumnsCount(); column++) {
                if (!game.isColumnFull(column)) {
                    return false;
                }
            }
            return true;
        };

        function showEnd({game, playerView}) {
            if (game.isPlayerWinner()) {
                playerView.showWinner();
            } else {
                consoleMPDS.writeln("You have tied!!!");
            }
        }
    };
}

function PlayerView(game) {
    assert(game ?? false);
    this.turn = game.getTurn();
    this.columnDialog = new LimitedIntDialog("column", game.getColumnsCount());
}
function initPlayerViewPrototype() { //LimitedIntDialog
    PlayerView.prototype.askColumn = function() {
        const prefix = `Player ${this.turn.getPlayerString()} choose`;
        this.columnDialog.setPrefix(prefix);
        return this.columnDialog.ask() - 1;
    };

    PlayerView.prototype.showErrorFullColumn = function() {
        consoleMPDS.writeln("Wrong column: it's full.");
    };

    PlayerView.prototype.showWinner = function() {
        consoleMPDS.writeln(`Player ${this.turn.getPlayerString()} won!!! ;-)`);
    };
}

function LimitedIntDialog(requested, max, min = 1, prefix = "Introduce") {
    assert(typeof requested === "string");
    assert(typeof prefix === "string");

    this.requested = requested;
    this.prefix = prefix;
    this.limits = new ClosedInterval(max, min);
}
function initLimitedIntDialogProtorype() { // ClosedInterval
    LimitedIntDialog.prototype.ask = function() {
        let answer;
        let error;
        do {
            answer = consoleMPDS.readNumber(`${this.prefix} ${this.requested}:`);
            error = !this.limits.includes(answer);
            if (error) {
                consoleMPDS.writeln(`Wrong ${this.requested}: it must be ${this.limits.toString()}`)
            }
        } while (error);
        return answer;
    };

    LimitedIntDialog.prototype.setPrefix = function(prefix) {
        assert(typeof prefix === "string");
        this.prefix = prefix;
    };
}

function ClosedInterval(max, min = 0) {
    assert(typeof max === "number");
    assert(typeof min === "number");
    assert(max >= min);
    this.max = max;
    this.min = min;
}
function initClosedIntervalPrototype() {
    ClosedInterval.prototype.includes = function (value) {
        assert(typeof value === "number");
        return this.min <= value && value <= this.max;
    };

    ClosedInterval.prototype.toString = function () {
        return `[${this.min}, ${this.max}]`;
    };  
}
function Game() {
    const NUM_PLAYERS = 2;
    this.board = new Board(NUM_PLAYERS);
    this.turn = new Turn(this.board, NUM_PLAYERS);
}
function initGamePrototype() { // Turn, Board
    Game.prototype.placePlayerToken = function (column) {
        this.turn.placePlayerToken(column);
    };

    Game.prototype.getColumnsCount = function () {
        return this.board.getColumnsCount();
    };

    Game.prototype.isColumnFull = function (column) {
        return this.board.isColumnFull(column);
    };

    Game.prototype.isPlayerWinner = function () {
        return this.turn.isPlayerWinner();
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
        this.board.reset();
        this.turn.reset();
    };
}

function Turn(board, numPlayers) {
    assert(board ?? false);
    assert(typeof numPlayers === "number");
    assert(numPlayers === Color.values().length - 1);
    for (let i = 0; i < numPlayers; i++) {
        assert(!Color.get(i).isNone());
    }    
    const colors = [];
    for (let i = 0; i < numPlayers; i++) {
        colors[i] = Color.get(i);
    }

    this.board = board;
    this.playersColors = colors;
    this.turnValue = 0;    
}
function initTurnPrototype() { // Color, Board(?)
    Turn.prototype.getPlayerString = function () {
        return getPlayerColor(this).toString();
    };

    Turn.prototype.placePlayerToken = function (column) {
        this.board.placeToken(column, getPlayerColor(this));
    };

    Turn.prototype.isPlayerWinner = function () {
        return this.board.isWinner(getPlayerColor(this));
    };

    Turn.prototype.change = function () {
        this.turnValue = (this.turnValue + 1) % this.playersColors.length;
    };

    Turn.prototype.reset = function () {
        this.turnValue = 0;
    };

    function getPlayerColor(turn) {
        return turn.playersColors[turn.turnValue];
    };
}

// enum aproach
function Color() {

    Color.X = initColor("X");
    Color.O = initColor("O");
    Color.NONE = initColor("_");

    Color.values = function () {
        return [Color.X, Color.O, Color.NONE];
    }

    Color.get = function (ordinal) {
        return Color.values()[ordinal];
    };

    function initColor(value) {
        const that = {
            value: value,

            isInValues(searched) {
                for (const color of Color.values()) {
                    if (searched === color) {
                        return true;
                    }
                }
                return false;
            }
        };

        return {
            ordinal() {
                assert(that.isInValues(this));
                const colors = Color.values();
                for (let i = 0; i < colors.length; i++) {
                    if (this === colors[i]) {
                        return i;
                    }
                }
            },

            isNone() {
                return this === Color.NONE;
            },

            toString() {
                return that.value;
            }
        }
    }
}

function Board(numPlayers) {
    assert(typeof numPlayers === "number");
    assert(numPlayers === Color.values().length - 1);
    for (let i = 0; i < numPlayers; i++) {
        assert(!Color.get(i).isNone());
    }

    const playersCoordinates = [];
    for (let i = 0; i < numPlayers; i++) {
        playersCoordinates[i] = [];
    }

    this.ROWS = 6;
    this.COLUMNS = 7;
    this.WIN_COUNT = 4;
    this.playersCoordinates = playersCoordinates;
}
function initBoardPrototype() {
    Board.prototype.getColor = function (row, column) {
        return getColor(new Coordinate(row, column), this);
    };

    function getColor(coordinate, board) {
        assert(isInBoard(coordinate, board));
        for (let i = 0; i < board.playersCoordinates.length; i++) {
            const color = Color.get(i);            

            if (isPlacedByPlayer(coordinate, color, board)) {
                return color;
            }
        }
        return Color.NONE;

        function isPlacedByPlayer(coordinate, color, board) {
            assert(coordinate ?? false);
            for (let playerCoordinate of getPlayerCoordinates(color, board)) {
                if (coordinate.equals(playerCoordinate)) {
                    return true;
                }
            }
            return false;
        }
    }

    function isInBoard(coordinate, board) {
        assert(coordinate ?? false);
        return new ClosedInterval(board.ROWS - 1).includes(coordinate.getRow())
            && new ClosedInterval(board.COLUMNS - 1).includes(coordinate.getColumn());
    };

    function getPlayerCoordinates(color, board) {
        assert(color ?? false);
        assert(!color.isNone());
        assert(new ClosedInterval(board.playersCoordinates.length - 1)
            .includes(color.ordinal()));
        return board.playersCoordinates[color.ordinal()];
    }

    Board.prototype.placeToken = function (column, color) {
        assert(!this.isColumnFull(column));
        const BOTTON_ROW = this.ROWS - 1;
        let placedCoordinate = new Coordinate(BOTTON_ROW, column);
        while (!isEmpty(placedCoordinate, this)) {
            placedCoordinate = placedCoordinate.shift(Direction.VERTICAL.inverse());
        }
        const coordinates = getPlayerCoordinates(color, this);
        coordinates[coordinates.length] = placedCoordinate;
    };

    Board.prototype.isColumnFull = function (column) {
        const TOP_ROW = 0;
        const topCoordinate = new Coordinate(TOP_ROW, column);
        return !isEmpty(topCoordinate, this);
    };

    function isEmpty(coordinate, board) {
        return getColor(coordinate, board).isNone();
    };
    
    Board.prototype.isWinner = function (color) {
        for (let direction of Direction.values()) {
            if (isWinnerInDirection(color, direction, this)) {
                return true;
            }
        }
        return false;

        function isWinnerInDirection(color, direction, board) {
            assert(direction ?? false);
            let win = false;
            let firstCoordinate = getLastPlaced(color, board);
            const numCoordinatesGroupsToCheck = board.WIN_COUNT;
            for (let i = 0; !win && i < numCoordinatesGroupsToCheck; i++) {
                let coordinates = getGroupToCheck(firstCoordinate, direction, board);
                win = isWinnerGroup(coordinates, color, board);
                if (!win) {
                    firstCoordinate = firstCoordinate.shift(direction.inverse());
                }
            }
            return win;
        };

        function getLastPlaced(color, board) {
            const coordinates = getPlayerCoordinates(color, board);
            return coordinates[coordinates.length - 1];
        };

        function getGroupToCheck(firstCoordinate, direction, board) {
            assert(firstCoordinate ?? false);
            let coordinates = [firstCoordinate];
            for (let i = 1; i < board.WIN_COUNT; i++) {
                coordinates[i] = coordinates[i - 1].shift(direction);
            }
            return coordinates;
        };

        function isWinnerGroup(coordinates, color, board) {
            assert(color ?? false);
            assert(!color.isNone());
            assert(coordinates ?? false);
            assert(coordinates.length >= board.WIN_COUNT);
            let win = true;
            for (let j = 0; win && j < coordinates.length; j++) {
                win = isInBoard(coordinates[j], board) && color === getColor(coordinates[j], board);
            }
            return win;
        }
    };
    
    Board.prototype.getRowsCount = function () {
        return this.ROWS;
    };

    Board.prototype.getColumnsCount = function () {
        return this.COLUMNS;
    };

    Board.prototype.reset = function () {
        for (let i = 0; i < this.playersCoordinates.length; i++) {
            this.playersCoordinates[i] = [];
        }
    };     
}

// enum aproach
function Direction() {

    Direction.VERTICAL = initDirection(1, 0);
    Direction.HORIZONTAL = initDirection(0, 1);
    Direction.DIAGONAL = initDirection(1, 1);
    Direction.INVERSE_DIAGONAL = initDirection(1, -1);

    Direction.values = function () {
        return [Direction.VERTICAL, Direction.HORIZONTAL,
        Direction.DIAGONAL, Direction.INVERSE_DIAGONAL];
    }

    function initDirection(rowShift, columnShift) {
        assert(typeof rowShift === "number");
        assert(rowShift % 1 === 0);
        assert(typeof columnShift === "number");
        assert(columnShift % 1 === 0);

        const that = {
            rowShift: rowShift,
            columnShift: columnShift,
        }

        return {
            inverse() {
                return initDirection(-that.rowShift, -that.columnShift);
            },

            getRowShift() {
                return that.rowShift;
            },

            getColumnShift() {
                return that.columnShift;
            }
        }
    }
}

function Coordinate(row, column) {
    assert(typeof row === "number");
    assert(row % 1 === 0);
    assert(typeof column === "number");
    assert(column % 1 === 0);
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
    this.CELL_CHARS_COUNT = 4;
    this.ROW_SEPARATOR = "_";
}
function initBoardViewProtoype() { // Board
    BoardView.prototype.show = function() {
        printTop(this);
        for (let row = 0; row < this.board.getRowsCount(); row++) {
            printRow(row, this);
        };

        function printTop(boardView) {
            const CORNER_CELL = " ";
            let msg = CORNER_CELL;
            for (let i = 0; i < boardView.board.getColumnsCount(); i++) {
                for (let j = 1; j < boardView.CELL_CHARS_COUNT; j++) {
                    msg += boardView.ROW_SEPARATOR;
                }
                msg += CORNER_CELL;
            }
            consoleMPDS.writeln(msg);
        };

        function printRow(row, boardView) {
            const CORNER_CELL = "|";
            let msg = CORNER_CELL;
            for (let column = 0; column <boardView.board.getColumnsCount(); column++) {
                msg += getCellMsg(row, column, boardView);
                msg += CORNER_CELL;
            }
            consoleMPDS.writeln(msg);
        };

        function getCellMsg(row, column, boardView) {
            let msg = "";
            for (let j = 1; j < boardView.CELL_CHARS_COUNT; j++) {
                if (isMiddleCharInCell(j, boardView)) {
                    msg += boardView.board.getColor(row, column).toString();
                } else {
                    msg += boardView.ROW_SEPARATOR;
                }
            }
            return msg;

            function isMiddleCharInCell(index, {CELL_CHARS_COUNT}) {
                return index === CELL_CHARS_COUNT / 2;
            }
        };
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
