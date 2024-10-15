const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initConnect4().play();

function initConnect4() {
    initEnumConfiguartor().setUp();

    const that = {
        continueDialog: initYesNoDialog("Do you want to continue?"),
    };

    return {
        play() {
            do {
                initGame().play();
                that.continueDialog.ask();
            } while (that.continueDialog.isAffirmative());
        }
    }

}

function initGame() {
    const NUM_PLAYERS = 2;
    const board = initBoard(NUM_PLAYERS);
    const that = {
        board: board,
        turn: initTurn(NUM_PLAYERS, board),

        showTitle() {
            consoleMPDS.writeln("--------- CONNECT4 ----------\n");
        },

        isPlayerWinner() {
            return this.turn.isPlayerWinner();
        },

        isBoardFull() {
            return this.board.isFull();
        },

        showEnd() {
            if (this.isPlayerWinner()) {
                this.turn.showPlayerWin();
            } else {
                consoleMPDS.writeln("You have tied!!!");
            }
        }
    }

    return {
        play() {
            that.showTitle();
            that.board.show();
            let end;
            do {
                that.turn.playerPlaceToken();
                that.board.show();
                end = that.isPlayerWinner() || that.isBoardFull();
                if (!end) {
                    that.turn.change();
                }
            } while (!end);
            that.showEnd();
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
        columnDialog: initLimitedIntDialog("column", board.getColumnDimension()),

        getPlayerColor() {
            return that.playersColors[that.turnValue];
        }
    }

    return {
        change() {
            that.turnValue = (that.turnValue + 1) % that.playersColors.length;
        },

        playerPlaceToken() {
            let column;
            let error;
            do {
                const prefix = `Player ${that.getPlayerColor().toString()} choose`;
                that.columnDialog.setPrefix(prefix);
                column = that.columnDialog.ask() - 1;
                error = that.board.isColumnFull(column);
                if (error) {
                    consoleMPDS.writeln("Wrong column: it's full.")
                }
            } while (error);
            that.board.placeToken(column, that.getPlayerColor());
        },

        isPlayerWinner() {
            return that.board.isWinner(that.getPlayerColor());
        },

        showPlayerWin() {
            consoleMPDS.writeln(`Player ${that.getPlayerColor().toString()} won!!! ;-)`);
        }
    }
}

function initBoard(numPlayers) {
    assert(typeof numPlayers === "number");
    assert(numPlayers > 1);
    assert(numPlayers === Color.values().length - 1);
    for (let i = 0; i < numPlayers; i++) {
        assert(!Color.get(i).isNone());
    }

    const playersPlaceds = [];
    for (let i = 0; i < numPlayers; i++) {
        playersPlaceds[i] = [];
    }
    const that = {
        ROWS: 6,
        COLUMNS: 7,
        playersPlaceds: playersPlaceds,

        isEmpty(coordinate) {
            return this.getColor(coordinate).isNone();
        },

        getColor(coordinate) {
            assert(this.isInBoard(coordinate));
            for (let i = 0; i < this.playersPlaceds.length; i++) {
                const color = Color.get(i);
                if (this.isPlacedByPlayer(coordinate, color)) {
                    return color;
                }
            }
            return Color.NONE;
        },

        isInBoard(coordinate) {
            assert(coordinate ?? false);
            const row = coordinate.getRow();
            const column = coordinate.getColumn();
            return initClosedInterval(that.ROWS - 1).includes(row)
                && initClosedInterval(that.COLUMNS - 1).includes(column);
        },

        isPlacedByPlayer(coordinate, color) {
            assert(coordinate ?? false);
            for (const placed of this.getPlacedsByPlayer(color)) {
                if (placed.getRow() === coordinate.getRow()
                    && placed.getColumn() === coordinate.getColumn()) {
                    return true;
                }
            }
            return false;
        },

        getPlacedsByPlayer(color) {
            assert(color ?? false);
            assert(!color.isNone());
            assert(initClosedInterval(this.playersPlaceds.length - 1)
                .includes(color.ordinal()));
            return this.playersPlaceds[color.ordinal()];
        },

        getLastPlaced(color) {
            const placeds = this.getPlacedsByPlayer(color);
            return placeds[placeds.length - 1];
        },

        isWinnerInDirection(color, direction) {
            let count = 1;
            const lastPlaced = this.getLastPlaced(color);
            for (let forward of [true, false]) {
                let ok;
                let current = lastPlaced;
                do {
                    current = current.shift(direction, forward);
                    ok = this.isInBoard(current) && this.getColor(current) === color;
                    if (ok) {
                        count++;
                    }
                } while (ok);
            }
            const GOAL = 4;
            return count >= GOAL;
        },

        lineMsg(CORNER, getBottom) {                
            let msg = CORNER;
            for (let i = 0; i < this.COLUMNS; i++) {
                const CELL_CHARS = 4;
                for (let j = 1; j < CELL_CHARS; j++) {                    
                    msg += getBottom(j === CELL_CHARS / 2, i);
                }
                msg += CORNER;
            }
            msg += "\n";
            return msg;
        },





        countTokens(column) {
            let tokensInColumn = 0;
            for (const sameColorCoordinates of this.playersPlaceds) {
                for (const coordinate of sameColorCoordinates) {
                    if (coordinate.getColumn() === column) {
                        tokensInColumn++;
                    }
                }
            }
            return tokensInColumn;
        },




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
            let target = initCoordinate(BOTTON_ROW, column);
            while (!that.isEmpty(target)) {
                target = target.shift(Direction.VERTICAL, false);
            }
            const placeds = that.getPlacedsByPlayer(color);
            placeds[placeds.length] = target;
        },

        isWinner(color) {
            for (const direction of Direction.values()) {
                if (that.isWinnerInDirection(color, direction)) {
                    return true;
                }
            }
            return false;
        },

        show() {
            const getCharInTop = separator => () => separator;
            const getCharInCell = (separator, row) => (inMiddle, column) => {
                if (inMiddle) {                    
                    return that.getColor(initCoordinate(row, column)).toString();
                } else {
                    return separator;
                }
            }
            const ROW_SEPARATOR = "_";
            let msg = that.lineMsg(" ", getCharInTop(ROW_SEPARATOR));
            for (let i = 0; i < that.ROWS; i++) {
                msg += that.lineMsg("|", getCharInCell(ROW_SEPARATOR, i));
            }
            consoleMPDS.writeln(msg);            
        },

        isFull() {
            for (let i = 0; i < that.COLUMNS; i++) {
                if (!this.isColumnFull(i)) {
                    return false;
                }
            }
            return true;
        },

        getColumnsCount() {
            return that.COLUMNS;
        },
    }
}

function initCoordinate(row, column) {
    assert(typeof row === "number");
    assert(typeof column === "number");

    const that = {
        row: row,
        column: column
    }
    return {
        shift(direction, forward) {
            assert(direction ?? false);
            assert(typeof forward === "boolean");
            const shiftedRow = direction.shiftRow(that.row, forward);
            const shiftedColumn = direction.shiftColumn(that.column, forward);
            return initCoordinate(shiftedRow, shiftedColumn);
        },

        getRow() {
            return that.row;
        },

        getColumn() {
            return that.column;
        }
    }
}

function Direction() {

    Direction.values = function () {
        return [Direction.VERTICAL, Direction.HORIZONTAL,
        Direction.DIAGONAL, Direction.INVERSE_DIAGONAL];
    }

    Direction.VERTICAL = initDirection(1, 0);
    Direction.HORIZONTAL = initDirection(0, 1);
    Direction.DIAGONAL = initDirection(1, 1);
    Direction.INVERSE_DIAGONAL = initDirection(1, -1);

    function initDirection(rowDiff, columnDiff) {
        const that = {
            rowDiff: rowDiff,
            columnDiff: columnDiff,
        }
        return {
            shiftRow(row, forward) {
                let shift = that.rowDiff;
                if (!forward) {
                    shift = -that.rowDiff;
                }
                return row + shift;
            },

            shiftColumn(column, forward) {
                let shift = that.columnDiff;
                if (!forward) {
                    shift = -that.columnDiff;
                }
                return column + shift;
            }
        }
    }
}

function Color() {
    Color.values = function () {
        return [Color.X, Color.O, Color.NONE];
    }

    Color.X = initColor("X");
    Color.O = initColor("O");
    Color.NONE = initColor("_");

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
                assert(false);
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
        YES: "y",
        NO: "n",
        question: question,
        answer: undefined,

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
    assert(requested ?? false);
    assert(prefix ?? false);

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
            assert(prefix ?? false);
            that.prefix = prefix;
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
