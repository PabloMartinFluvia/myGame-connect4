import { Board } from "../models/Board.mjs";
import { Coordinate } from "../models/Coordinate.mjs";
import { assert } from "../utils/assert.mjs";

export class BoardView {

    #board;
    #cells;
    #error;
    #onClickCellListener;    

    constructor(board, onColumnSelectedCallback) {
        assert(board instanceof Board);
        assert(typeof onColumnSelectedCallback === "function");

        this.#board = board;
        this.#initCells();
        this.#initError();
        this.#initOnClickCellListener(onColumnSelectedCallback);        
    }

    #initCells() {
        this.#cells = [];
        const boardTable = document.createElement("table");
        boardTable.id = "board";
        for (let row = Coordinate.NUMBER_ROWS - 1; row >= 0; row--) {
            const tableRow = document.createElement("tr");
            for (let column = 0; column < Coordinate.NUMBER_COLUMNS; column++) {
                const cell = document.createElement("td");
                cell.className = "cell";
                cell.row = row;
                cell.column = column;
                cell.getCoordinate = function () {
                    return new Coordinate(this.row, this.column);
                }
                this.#cells.push(cell);
                tableRow.appendChild(cell);
            }
            boardTable.appendChild(tableRow);
        }        
        this.#getBoardContainer().appendChild(boardTable);
    }

    #getBoardContainer() {
        return document.getElementById("board-container");
    }

    #initError() {
        this.#error = document.createElement('div');
        this.#error.appendChild(document.createTextNode("Column is Full"));
        // TODO: add style            
        this.#hiddeError();
        this.#getBoardContainer().appendChild(this.#error);
    }

    #showError() {
        this.#error.style.visibility = "visible";
    }

    #hiddeError() {
        this.#error.style.visibility = "hidden";
    }

    #initOnClickCellListener(onColumnSelectedCallback) {
        this.#onClickCellListener = event => {
            const column = event.target.column;
            if (!this.#board.isComplete(column)) {
                this.#disableInteraction();
                this.#hiddeError();
                onColumnSelectedCallback(column);
            } else {                                                    
                this.#showError();
            }
        }
    }

    allowInteraction() {
        this.#cells.forEach(cell => {
            cell.addEventListener("click", this.#onClickCellListener);
        })
    }

    #disableInteraction() {
        this.#cells.forEach(cell => {
            cell.removeEventListener("click", this.#onClickCellListener)
        });
    }

    show() {
        this.#cells.forEach(cell => {
            const color = this.#board.getColor(cell.getCoordinate());
            cell.style.backgroundColor = !color.isNull() ? color.getName().toLowerCase() : "white";
        });
    }
}