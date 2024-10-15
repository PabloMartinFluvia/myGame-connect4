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
            for (let i = 0; i < this.board.getColumnsCount(); i++) {
                if (!this.board.isColumnFull(i)) {
                    return false;
                }
            }
            return true;
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
        columnDialog: initLimitedIntDialog("column", board.getColumnsCount()),

        getPlayerColor() {
            return that.playersColors[that.turnValue];
        },

        askColumnInValidRange() {
            const prefix = `Player ${that.getPlayerColor().toString()} choose`;
            this.columnDialog.setPrefix(prefix);
            return that.columnDialog.ask() - 1;
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
                column = that.askColumnInValidRange();
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
            return coordinate.hasRowInInterval(initClosedInterval(that.ROWS - 1))
                && coordinate.hasColumnInInterval(initClosedInterval(that.COLUMNS - 1));
        },

        isPlacedByPlayer(coordinate, color) {
            assert(coordinate ?? false);
            for (const placed of this.getPlacedsByPlayer(color)) {
                if (coordinate.equals(placed)) {
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
                    current = direction.shift(current, forward);                    
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
                target = Direction.VERTICAL.shift(target, false);
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

        getColumnsCount() {
            return that.COLUMNS;
        },
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
        shift(rowShift, columnShift) {                  
            assert(typeof rowShift === "number");
            assert(typeof columnShift === "number");
            return initCoordinate(that.row + rowShift, that.column + columnShift);
        },

        equals(other) {
            assert(other ?? false);
            const rowInterval = initClosedInterval(that.row, that.row);
            const columnInterval = initClosedInterval(that.column, that.column);
            return other.hasRowInInterval(rowInterval)
                && other.hasColumnInInterval(columnInterval);
        },

        hasRowInInterval(interval) {
            assert(interval ?? false);
            return interval.includes(that.row);
        },

        hasColumnInInterval(interval) {
            assert(interval ?? false);
            return interval.includes(that.column);
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
            shift(coordinate, forward) {
                assert(coordinate ?? false);
                assert(typeof forward === "boolean");
                let rowShift = that.rowShift;
                let columnShift = that.columnShift;
                if  (!forward) {
                    rowShift = -rowShift;
                    columnShift = -columnShift;
                }
                return coordinate.shift(rowShift, columnShift);
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
