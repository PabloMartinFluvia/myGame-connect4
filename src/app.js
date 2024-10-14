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

        isWinnerActual() {
            return this.turn.isWinnerActual();
        },

        isBoardFull() {
            return this.board.isFull();
        },

        showEnd() {
            if (this.isWinnerActual()) {
                this.turn.showWinActual();
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
                that.turn.placeTokenActual();
                that.board.show();
                end = that.isWinnerActual() || that.isBoardFull();
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
    assert(numPlayers > 1);
    assert(numPlayers === Color.values().length - 1);

    const that = {
        players: undefined,
        turnValue: 0,

        getActive() {
            return that.players[that.turnValue];
        }
    }
    that.players = [];
    for (let i = 0; i < numPlayers; i++) {
        that.players[i] = initPlayer(board, Color.get(i));
    }

    return {
        change() {
            that.turnValue = (that.turnValue + 1) % that.players.length;
        },

        placeTokenActual() {
            that.getActive().placeToken();
        },

        isWinnerActual() {
            return that.getActive().isWinner();
        },

        showWinActual() {
            that.getActive().showWin();
        }
    }
}

function initPlayer(board, color) {
    assert(board ?? false);
    assert(color ?? false);
    assert(!color.isNone());

    const that = {
        board: board,
        color: color,
        limitedIntDialog: undefined
    }
    const prefix = `Player ${that.color.toString()} choose`;
    const requested = `column`;
    const max = that.board.getColumnsLenght();
    that.limitedIntDialog = initLimitedIntDialog(requested, prefix, max);

    return {
        placeToken() {
            let column;
            let error;
            do {
                column = that.limitedIntDialog.ask() - 1;
                error = that.board.isColumnFull(column);
                if (error) {
                    consoleMPDS.writeln("Wrong column: it's full.")
                }
            } while (error);
            that.board.placeToken(column, that.color);
        },

        isWinner() {
            return that.board.isWinner(that.color);
        },

        showWin() {
            consoleMPDS.writeln(`Player ${that.color.toString()} won!!! ;-)`);
        }
    }
}

function initBoard(numPlayers) {
    assert(typeof numPlayers === "number");
    assert(numPlayers > 1);
    assert(numPlayers === Color.values().length - 1);

    const that = {
        ROWS: 6,
        COLUMNS: 7,
        playersCoordinates: undefined,

        getTokens(column) {
            const tokensInColumn = [];
            for (const playerCoordinates of this.playersCoordinates) {
                for (const coordinate of playerCoordinates) {
                    if (coordinate.isInColumn(column)) {
                        tokensInColumn[tokensInColumn.length] = coordinate;
                    }
                }
            }
            return tokensInColumn;
        },

        isWinnerInDirection(color, direction) {
            const lastPlaced = this.getLastCoordinate(color);
            let count = 1;
            for (let forward of [true, false]) {
                let ok;
                let last = lastPlaced;
                do {
                    let shifted = last.shift(direction, forward);
                    ok = this.isInBoard(shifted) && color === this.getColor(shifted);
                    if (ok) {
                        count++;
                        last = shifted;
                    }
                } while (ok);
            }
            const GOAL = 4;
            return count >= GOAL;
        },

        getLastCoordinate(color) {
            const coordinates = this.getCoordinates(color);
            return coordinates[coordinates.length - 1];
        },

        getCoordinates(color) {
            assert(color ?? false);
            assert(initClosedInterval(this.playersCoordinates.length - 1, 0).includes(color.ordinal()));
            return this.playersCoordinates[color.ordinal()];
        },

        getColor(searched) {
            assert(this.isInBoard(searched));
            for (let i = 0; i < this.playersCoordinates.length; i++) {
                for (let coordinate of this.playersCoordinates[i]) {
                    if (coordinate.getRow() === searched.getRow()
                        && coordinate.getColumn() === searched.getColumn()) {
                        const color = Color.get(i);
                        return color;
                    }
                }
            }
            return Color.NONE;
        },

        isInBoard(coordinate) {
            assert(coordinate ?? false);
            return initClosedInterval(that.ROWS - 1, 0).includes(coordinate.getRow())
                && initClosedInterval(that.COLUMNS - 1, 0).includes(coordinate.getColumn());
        }
    };
    that.playersCoordinates = [];
    for (let i = 0; i < numPlayers; i++) {
        that.playersCoordinates[i] = [];
    }


    return {
        isColumnFull(column) {
            assert(initClosedInterval(that.COLUMNS - 1, 0).includes(column));
            return that.getTokens(column).length === that.ROWS;
        },

        getColumnsLenght() {
            return that.COLUMNS;
        },

        placeToken(column, color) {
            assert(!this.isColumnFull(column));
            const row = that.ROWS - 1 - that.getTokens(column).length;
            const coordinates = that.getCoordinates(color);
            coordinates[coordinates.length] = initCoordinate(row, column);
        },

        isWinner(color) {
            assert(color ?? false);
            assert(!color.isNone());
            assert(initClosedInterval(that.playersCoordinates.length - 1, 0).includes(color.ordinal()));

            const directions = Direction.values();
            for (const direction of directions) {
                if (that.isWinnerInDirection(color, direction)) {
                    return true;
                }
            }
            return false;
        },

        isFull() {
            for (let i = 0; i < that.COLUMNS; i++) {
                if (!this.isColumnFull(i)) {
                    return false;
                }
            }
            return true;
        },

        show() {
            const VERTICAL_SEPARATOR = "|";
            const HORIZONTAL_SEPARATOR = "_";
            for (let j = 0; j < that.COLUMNS; j++) {
                consoleMPDS.write(` ${HORIZONTAL_SEPARATOR}${HORIZONTAL_SEPARATOR}${HORIZONTAL_SEPARATOR}`)
            }
            consoleMPDS.writeln();
            for (let i = 0; i < that.ROWS; i++) {
                consoleMPDS.write(VERTICAL_SEPARATOR);
                for (let j = 0; j < that.COLUMNS; j++) {
                    const color = that.getColor(initCoordinate(i, j));
                    consoleMPDS.write(`${HORIZONTAL_SEPARATOR}${color.toString()}${HORIZONTAL_SEPARATOR}${VERTICAL_SEPARATOR}`)
                }
                consoleMPDS.writeln();
            }
            consoleMPDS.writeln();
        }
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
        isInColumn(column) {
            assert(typeof column === "number");
            assert(column >= 0);
            return column === that.column;
        },

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

    Direction.VERTICAL = initDirection(0, 1);
    Direction.HORIZONTAL = initDirection(1, 0);
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

function initLimitedIntDialog(requested, prefix, max, min = 1) {
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
        }
    }
}

function initClosedInterval(max, min) {
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
