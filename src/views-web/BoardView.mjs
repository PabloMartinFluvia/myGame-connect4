import { Board } from "../models/Board.mjs";
import { Coordinate } from "../models/Coordinate.mjs";
import { assert } from "../utils/assert.mjs";

export class BoardView {
    
    #board;
    #cells;
    #onClickCellListener;

    constructor(board, onColumnSelectedCallback) {
        assert(board instanceof Board);
        assert(typeof onColumnSelectedCallback === "function");

        this.#board = board;     
        this.#createTable();   
        this.#onClickCellListener = event => {            
            this.#cells.forEach(cell => {cell.removeEventListener("click", this.#onClickCellListener)});                              
            onColumnSelectedCallback(event.target.column);
        }
    }

    #createTable() {
        this.#cells = [];
        const boardTable = document.createElement("table");
        boardTable.id = "board";
        for (let row = Coordinate.NUMBER_ROWS - 1; row >= 0; row--) {
            const tr = document.createElement("tr");
            for (let column = 0; column < Coordinate.NUMBER_COLUMNS; column++) {
                const td = document.createElement("td");
                td.className = "cell";
                td.row = row;
                td.column = column;
                td.getCoordinate = function () {
                    return new Coordinate(this.row, this.column);
                }
                this.#cells.push(td);
                tr.appendChild(td);
            }
            boardTable.appendChild(tr);
        }
        const container = document.getElementById("board-container");
        container.appendChild(boardTable);
    }

    allowInteraction() {
        this.#cells.forEach(cell => {        
            cell.addEventListener("click", this.#onClickCellListener);
        })
    }

    show() {
        this.#cells.forEach(cell => {
            const color = this.#board.getColor(cell.getCoordinate());
            cell.style.backgroundColor = (color.getName() ?? "white").toLowerCase();
        });
    }
}