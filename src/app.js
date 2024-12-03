const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initConnect4().play();

function initConnect4() {
    initEnumConfiguartor().setUp();

    const game = initGame()
    const that = {
        game: game,
        gameView: initGameView(game)
    }

    return {
        play() {
            const resumeDialog = initYesNoDialog("Do you want to continue?");
            let resume;
            do {
                that.gameView.play();
                resumeDialog.ask();
                resume = resumeDialog.isAffirmative();
                if (resume) {
                    that.game.reset();
                }
            } while (resume);
        }
    }

}

function initGameView(game) {
    const that = {
        game: game,
        boardView: initBoardView(game),
        playerView: initPlayerView(game),

        askColumn() {
            let column;
            let error;
            do {
                column = that.playerView.askColumn();
                error = that.game.isColumnFull(column);
                if (error) {
                    that.playerView.showErrorFullColumn();
                }
            } while (error);
            return column;
        },

        isBoardFull() {
            for (let column = 0; column < this.game.getColumnsCount(); column++) {
                if (!this.game.isColumnFull(column)) {
                    return false;
                }
            }
            return true;
        },

        showEnd() {
            if (this.game.isPlayerWinner()) {
                this.playerView.showWinner();
            } else {
                consoleMPDS.writeln("You have tied!!!");
            }
        }
    }

    return {
        play() {
            consoleMPDS.writeln("--------- CONNECT4 ----------\n");
            that.boardView.show();
            let end;
            do {
                const column = that.askColumn();
                that.game.placePlayerToken(column);
                that.boardView.show();
                end = that.game.isPlayerWinner() || that.isBoardFull();
                if (!end) {
                    that.game.changeTurn();
                }
            } while (!end);
            that.showEnd();
        }
    }
}

function initGame() {
    const NUM_PLAYERS = 2;
    const board = initBoard(NUM_PLAYERS);
    const that = {
        board: board,
        turn: initTurn(NUM_PLAYERS, board),
    }

    return {
        placePlayerToken(column) {
            that.turn.placePlayerToken(column);
        },

        getColumnsCount() {
            return that.board.getColumnsCount();
        },

        isColumnFull(column) {
            return that.board.isColumnFull(column);
        },

        isPlayerWinner() {
            return that.turn.isPlayerWinner();
        },

        changeTurn() {
            that.turn.change();
        },

        getTurn() {
            return that.turn;
        },

        getBoard() {
            return that.board;
        },

        reset() {
            that.board.reset();
            that.turn.reset();
        }
    }
}

function initPlayerView(game) {
    const that = {
        turn: game.getTurn(),
        columnDialog: initLimitedIntDialog("column", game.getColumnsCount()),
    }

    return {
        askColumn() {
            const prefix = `Player ${that.turn.getPlayerString()} choose`;
            that.columnDialog.setPrefix(prefix);
            return that.columnDialog.ask() - 1;
        },

        showErrorFullColumn() {
            consoleMPDS.writeln("Wrong column: it's full.");
        },

        showWinner() {
            consoleMPDS.writeln(`Player ${that.turn.getPlayerString()} won!!! ;-)`);
        }
    }
}

function initTurn(numPlayers, board) {
    assert(typeof numPlayers === "number");
    assert(numPlayers === Color.values().length - 1);
    for (let i = 0; i < numPlayers; i++) {
        assert(!Color.get(i).isNone());
    }
    assert(board ?? false);

    const colors = [];
    for (let i = 0; i < numPlayers; i++) {
        colors[i] = Color.get(i);
    }
    const that = {
        playersColors: colors,
        turnValue: 0,
        board: board,

        getPlayerColor() {
            return this.playersColors[this.turnValue];
        }
    }

    return {
        getPlayerString() {
            return that.getPlayerColor().toString();
        },

        placePlayerToken(column) {
            that.board.placeToken(column, that.getPlayerColor());
        },

        isPlayerWinner() {
            return that.board.isWinner(that.getPlayerColor());
        },

        change() {
            that.turnValue = (that.turnValue + 1) % that.playersColors.length;
        },

        reset() {
            that.turnValue = 0;
        }
    }
}

function initBoardView(game) {
    const that = {
        board: game.getBoard(),
        CELL_CHARS_COUNT: 4,
        ROW_SEPARATOR: "_",


        printTop() {
            const CORNER_CELL = " ";
            let msg = CORNER_CELL;
            for (let i = 0; i < this.board.getColumnsCount(); i++) {
                for (let j = 1; j < this.CELL_CHARS_COUNT; j++) {
                    msg += that.ROW_SEPARATOR;
                }
                msg += CORNER_CELL;
            }
            consoleMPDS.writeln(msg);
        },

        printRow(row) {
            const CORNER_CELL = "|";
            let msg = CORNER_CELL;
            for (let column = 0; column < this.board.getColumnsCount(); column++) {
                msg += this.getCellMsg(row, column);
                msg += CORNER_CELL;
            }
            consoleMPDS.writeln(msg);
        },

        getCellMsg(row, column) {
            let msg = "";
            for (let j = 1; j < this.CELL_CHARS_COUNT; j++) {
                if (this.isMiddleCharInCell(j)) {
                    msg += this.board.getColor(row, column).toString();
                } else {
                    msg += this.ROW_SEPARATOR;
                }
            }
            return msg;
        },

        isMiddleCharInCell(index) {
            return index === this.CELL_CHARS_COUNT / 2;
        }
    }
    return {
        show() {
            that.printTop();
            for (let row = 0; row < that.board.getRowsCount(); row++) {
                that.printRow(row);
            }
        }
    }
}

function initBoard(numPlayers) {
    assert(typeof numPlayers === "number");
    assert(numPlayers === Color.values().length - 1);
    for (let i = 0; i < numPlayers; i++) {
        assert(!Color.get(i).isNone());
    }

    const playersCoordinates = [];
    for (let i = 0; i < numPlayers; i++) {
        playersCoordinates[i] = [];
    }
    const that = {
        ROWS: 6,
        COLUMNS: 7,
        WIN_COUNT: 4,
        playersCoordinates: playersCoordinates,

        isEmpty(coordinate) {
            return this.getColor(coordinate).isNone();
        },

        getColor(coordinate) {
            assert(this.isInBoard(coordinate));
            for (let i = 0; i < this.playersCoordinates.length; i++) {
                const color = Color.get(i);
                if (this.isPlacedByPlayer(coordinate, color)) {
                    return color;
                }
            }
            return Color.NONE;
        },

        isInBoard(coordinate) {
            assert(coordinate ?? false);
            return initClosedInterval(that.ROWS - 1).includes(coordinate.getRow())
                    && initClosedInterval(that.COLUMNS - 1).includes(coordinate.getColumn());
        },

        isPlacedByPlayer(coordinate, color) {
            assert(coordinate ?? false);
            for (let playerCoordinate of this.getPlayerCoordinates(color)) {
                if (coordinate.equals(playerCoordinate)) {
                    return true;
                }
            }
            return false;
        },

        getPlayerCoordinates(color) {
            assert(color ?? false);
            assert(!color.isNone());
            assert(initClosedInterval(this.playersCoordinates.length - 1)
                .includes(color.ordinal()));
            return this.playersCoordinates[color.ordinal()];
        },

        getLastPlaced(color) {
            const coordinates = this.getPlayerCoordinates(color);
            return coordinates[coordinates.length - 1];
        },

        isWinnerInDirection(color, direction) {
            assert(direction ?? false);
            let win = false;
            let firstCoordinate = this.getLastPlaced(color);
            const numCoordinatesGroupsToCheck = that.WIN_COUNT;
            for (let i = 0; !win && i < numCoordinatesGroupsToCheck; i++) {
                let coordinates = this.getGroupToCheck(firstCoordinate, direction);
                win = this.isWinnerGroup(coordinates, color);
                if (!win) {
                    firstCoordinate = firstCoordinate.shift(direction.inverse());
                }
            }
            return win;
        },

        getGroupToCheck(firstCoordinate, direction) {
            assert(firstCoordinate ?? false);
            let coordinates = [firstCoordinate];
            for (let i = 1; i < that.WIN_COUNT; i++) {
                coordinates[i] = coordinates[i - 1].shift(direction);
            }
            return coordinates;
        },

        isWinnerGroup(coordinates, color) {
            assert(color ?? false);
            assert(!color.isNone());
            assert(coordinates ?? false);
            assert(coordinates.length >= that.WIN_COUNT);
            let win = true;
            for (let j = 0; win && j < coordinates.length; j++) {
                win = this.isInBoard(coordinates[j]) && color === this.getColor(coordinates[j]);
            }
            return win;
        }
    };

    return {
        isColumnFull(column) {
            const TOP_ROW = 0;
            const topCoordinate = initCoordinate(TOP_ROW, column);
            return !that.isEmpty(topCoordinate);
        },

        placeToken(column, color) {
            assert(!this.isColumnFull(column));
            const BOTTON_ROW = that.ROWS - 1;
            let placedCoordinate = initCoordinate(BOTTON_ROW, column);
            while (!that.isEmpty(placedCoordinate)) {
                placedCoordinate = placedCoordinate.shift(Direction.VERTICAL.inverse());
            }
            const coordinates = that.getPlayerCoordinates(color);
            coordinates[coordinates.length] = placedCoordinate;
        },

        getColor(row, column) {
            return that.getColor(initCoordinate(row, column));
        },

        isWinner(color) {
            for (let direction of Direction.values()) {
                if (that.isWinnerInDirection(color, direction)) {
                    return true;
                }
            }
            return false;
        },

        getRowsCount() {
            return that.ROWS;
        },

        getColumnsCount() {
            return that.COLUMNS;
        },

        reset() {
            for (let i = 0; i < that.playersCoordinates.length; i++) {
                that.playersCoordinates[i] = [];
            }
        }
    }
}

function initCoordinate(row, column) {
    assert(typeof row === "number");
    assert(row % 1 === 0);
    assert(typeof column === "number");
    assert(column % 1 === 0);

    const that = {
        row: row,
        column: column
    }
    return {
        shift(direction) {
            assert(direction ?? false);
            const row = that.row + direction.getRowShift();
            const column = that.column + direction.getColumnShift();
            return initCoordinate(row, column);
        },

        equals(other) {
            assert(other ?? false);
            return that.row === other.getRow() && that.column === other.getColumn();
        },

        getRow() {
            return that.row;
        },

        getColumn() {
            return that.column;
        }
    }
}

function initClosedInterval(max, min = 0) {
    assert(typeof max === "number");
    assert(typeof min === "number");
    assert(max >= min);

    const that = {
        max,
        min
    }

    return {
        includes(value) {
            assert(typeof value === "number");
            return that.min <= value && value <= that.max;
        },

        toString() {
            return `[${that.min}, ${that.max}]`;
        }
    }
}

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

function initYesNoDialog(question) {
    assert(typeof question === "string");

    const that = {
        question: question,
        answer: undefined,
        YES: "y",
        NO: "n",

        isNegative() {
            return that.answer === that.NO;
        }
    };

    return {
        ask() {
            let error = false;
            do {
                that.answer = consoleMPDS.readString(`${that.question} (${that.YES}/${that.NO}):`);
                error = !this.isAffirmative() && !that.isNegative();
                if (error) {
                    consoleMPDS.writeln(`Please, answer "${that.YES}" or "${that.NO}"`);
                }
            } while (error);
        },

        isAffirmative() {
            return that.answer === that.YES;
        }
    };
}

function initLimitedIntDialog(requested, max, min = 1, prefix = "Introduce") {
    assert(typeof requested === "string");
    assert(typeof prefix === "string");

    const that = {
        requested: requested,
        prefix: prefix,
        limits: initClosedInterval(max, min)
    };

    return {
        ask() {
            let answer;
            let error;
            do {
                answer = consoleMPDS.readNumber(`${that.prefix} ${that.requested}:`);
                error = !that.limits.includes(answer);
                if (error) {
                    consoleMPDS.writeln(`Wrong ${that.requested}: it must be ${that.limits.toString()}`)
                }
            } while (error);
            return answer;
        },

        setPrefix(prefix) {
            assert(typeof prefix === "string");
            that.prefix = prefix;
        }
    }
}



function initEnumConfiguartor() {
    return {
        setUp() {
            Color();
            Object.freeze(Color);
            Direction();
            Object.freeze(Direction);
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
