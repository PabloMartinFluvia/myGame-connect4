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
            for (let column = 0; column < Coordinate.COLUMN_DIMENSION; column++) {
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
    this.columnDialog = new LimitedIntDialog(Coordinate.COLUMN_DIMENSION);
}
function initPlayerViewPrototype() {
    PlayerView.prototype.readToken = function () {
        const player = getPlayer(this);
        let column;
        let error;
        do {             
            const question = `${Messages.READ_TOKEN_PREFIX}${player}${Messages.READ_TOKEN_SUFIX}`;
            column = this.columnDialog.ask(question) - 1;
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
        const columns = Coordinate.COLUMN_DIMENSION;
        showTopLine(columns, this);        
        for (let row = 0; row < Coordinate.ROW_DIMENSION; row++) {
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
    this.tokenCoordinatesMap = new Map();
    tokens.forEach(token => this.tokenCoordinatesMap.set(token, new Set()));
}
function initBoardPrototype() {  

    Board.prototype.placeToken = function (token, column) {
        assert(isValidToken(token, this));
        assert(!this.isColumnFull(column));

        let placed = Coordinate.createBotton(column);
        while (!isEmpty(placed, this)) {            
            placed = placed.shift(Direction.toTop);
        };
        this.tokenCoordinatesMap.get(token).add(placed);        
    };

    function isValidToken(token, {tokenCoordinatesMap}) {        
        return Array.from(tokenCoordinatesMap.keys()).some(key => key === token);
    }

    Board.prototype.isColumnFull = function (column) {        
        return !isEmpty(Coordinate.createTop(column), this);
    };

    function isEmpty(coordinate, board) {
        return board.getToken(coordinate) === null;
    }

    Board.prototype.getToken = function (coordinate) {
        for (let [token, coordinatesSet] of this.tokenCoordinatesMap.entries()) {   
            for (let placed of coordinatesSet) {
                if (placed.equals(coordinate)) {
                    return token;
                }
            }  
        }
        return null;
    };

    Board.prototype.isWinner = function (token) {
        assert(isValidToken(token, this));
        const WIN_COUNT = 4;

        const coordinates = Array.from(this.tokenCoordinatesMap.get(token));
        const lastPlaced = coordinates[coordinates.length - 1];
        for (let direction of Direction.getAll()) {  
            let count = 1;
            for (let directionArrow of [direction, direction.inverse()]) {
                const candidates = lastPlaced.getShifteds(directionArrow, WIN_COUNT - 1);                
                count += countCandidates(candidates, this);                
            }  
            if (count >= WIN_COUNT) {
                return true;
            }

        }
        return false;

        function countCandidates (candidates, board) {
            let count = 0;
            let stop = false;            
            for (let i = 0;!stop && i < candidates.length; i++) {
                if (board.getToken(candidates[i]) === token) {
                    count++;
                } else {
                    stop = true;
                }                
            }
            return count;
        }
    };  
    
    Board.prototype.reset = function () {
        for (let coordinateSet of this.tokenCoordinatesMap.values()) {
            coordinateSet.clear();
        };
    };
}

function Direction(rowShift, columnShift) {
    this.rowShift = rowShift;
    this.columnShift = columnShift;
}
function initDirectionPrototype() {
    Direction.toTop = new Direction(-1, 0);

    Direction.getAll = function () {
        const toTop = Direction.toTop;
        const toRight = new Direction(0, 1);
        const toTopRight = new Direction(-1, 1);
        const toDownRight = new Direction(1, 1);
        return [toTop, toRight, toTopRight, toDownRight];
    };

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
    assert(Coordinate.isValidRow(row));
    assert(Coordinate.isValidColumn(column));

    this.row = row;
    this.column = column;
}
function initCoordinatePrototype() {
    Coordinate.ROW_DIMENSION = 6;
    Coordinate.COLUMN_DIMENSION = 7;
    Coordinate.MIN = 0;

    Coordinate.isValidRow = function (row) {
        const interval = new IntervalClosed(Coordinate.ROW_DIMENSION - 1);        
        return Number.isInteger(row) && interval.includes(row);
    };

    Coordinate.isValidColumn = function (column) {
        const interval = new IntervalClosed(Coordinate.COLUMN_DIMENSION - 1);        
        return Number.isInteger(column) && interval.includes(column);
    };

    Coordinate.createTop = function (column) {
        return new Coordinate(Coordinate.MIN, column);
    };

    Coordinate.createBotton = function (column) {
        return new Coordinate(Coordinate.ROW_DIMENSION - 1, column);        
    };

    Coordinate.prototype.getShifteds = function (direction, maxLength) {        
        let shifteds = [];
        let prev = this;
        while (prev.isShiftedInDimension(direction) && shifteds.length <= maxLength) {
            prev = prev.shift(direction);
            shifteds.push(prev);            
        }       
        return shifteds;
    }

    Coordinate.prototype.isShiftedInDimension = function (direction) {
        assert(direction ?? false);
        return Coordinate.isValidRow(shiftRow(direction, this)) 
            && Coordinate.isValidColumn(shiftColumn(direction, this));
    };

    function shiftRow(direction, {row}) {
        return row + direction.getRowShift();
    };

    function shiftColumn(direction, {column}) {
        return column + direction.getColumnShift();
    };

    Coordinate.prototype.shift = function (direction) {
        assert(this.isShiftedInDimension(direction));
        return new Coordinate(shiftRow(direction, this), shiftColumn(direction, this));
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
    LimitedIntDialog.prototype.ask = function (question) {
        let answer;
        let error;
        do {
            answer = consoleMPDS.readNumber(question);
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
