import { Board } from "../models/Board.mjs";
import { Coordinate } from "../models/Coordinate.mjs";

import { assert } from "../utils/assert.mjs";

export class BoardView {
    #board;
    #boardCells;    
    #boardObserver;
    #onClickCellListener;

    constructor(board) {
        assert(board instanceof Board);

        this.#board = board;
        this.#setupBoardCells(); 
        this.#onClickCellListener = this.#onClickCell.bind(this);   
    }

    #setupBoardCells() {
        this.#boardCells = document.querySelectorAll("#board td");
    }    

    registerBoardObserver(boardObserver) {
        this.#boardObserver = boardObserver;
    }

    interact() {
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.#boardCells.forEach(cell => {
            cell.addEventListener("click", this.#onClickCellListener);
        })
    }

    disableInteraction() {
        this.#boardCells.forEach(cell => {
            cell.removeEventListener("click", this.#onClickCellListener);            
        })
    }

    #onClickCell(event) {
        const column = this.#getColumn(event.target);
        this.#boardObserver.onColumnSelected(column);
    }    

    #getColumn(cell) {
        return  Number.parseInt(cell.getAttribute("column"));
    }

    show() {
        for (let cell of this.#boardCells) {
            const coordinate = this.#toCoordinate(cell);
            const color = this.#board.getColor(coordinate);
            cell.style.backgroundColor = (color.getName() ?? "white").toLowerCase();
        }
    }

    #toCoordinate(cell) {
        const column = this.#getColumn(cell);
        const row = Number.parseInt(cell.parentElement.getAttribute("row"));        
        return new Coordinate(row, column);
    }
}