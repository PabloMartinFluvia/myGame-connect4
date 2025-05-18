import { Coordinate } from "../models/Coordinate.mjs";
import { assert } from "../utils/assert.mjs";
import { UseCaseView } from "./UseCaseView.mjs";
import { UserPlayer } from "../models/Players.mjs";
import { GameError } from "../models/Error.mjs";

export class DropTokenView extends UseCaseView {


    constructor(turn, board) {
        super(turn, board);
        this.#configListeners();
    }

    #configListeners() {
        const boardTable = document.getElementById('board');
        for (let i = Coordinate.NUMBER_ROWS - 1; i >= 0; i--) {
            const rowElement = boardTable.insertRow();
            for (let j = 0; j < Coordinate.NUMBER_COLUMNS; j++) {
                const cell = rowElement.insertCell();
                cell.setAttribute('row', i);
                cell.setAttribute('column', j);
                cell.addEventListener('click', this.onClickColumn.bind(this));
                this.#styleCell(cell);

            }
        }
        this.#styleBoard(boardTable);
    }

    // https://codepen.io/chriscoyier/pen/NWKrXQx

    #styleBoard(boardTable) {
        boardTable.style.borderCollapse = "separate";
        boardTable.style.borderSpacing = "1em";
        boardTable.style.margin = "1rem auto";
        boardTable.style.backgroundColor = "lightblue";
    }

    #styleCell(cell) {
        cell.style.padding = "1rem 1rem";
        cell.style.borderRadius = "26px";
        cell.style.backgroundColor = "white";
    }

    enable() {
        this.#printBoard()
        this.#play();
    }

    #play() {
        const player = this.#getActivePlayer();
        const turnInfoElement = document.getElementById("turnInfo");
        let turnMsg = "Turn: " + player.getName();
        if (turnInfoElement.firstChild) {
            turnInfoElement.firstChild.nodeValue = turnMsg;
        } else {
            const turnTextNode = document.createTextNode(turnMsg);
            turnInfoElement.appendChild(turnTextNode);
        }
        player.accept(this);
    }

    visitUserPlayer(userPlayer) {
        super.enable();
    }

    onClickColumn(event) {
        if (this._isEnabled()) {
            assert(this.#getActivePlayer() instanceof UserPlayer);

            const column = Number.parseInt(event.target.getAttribute('column'));
            const error = this.#getActivePlayer().getErrorColumn(column);
            const errorElement = document.getElementById("errorInfo");
            if (error.isNull()) {
                const errorTextNode = errorElement.firstChild;
                if (errorTextNode) {
                    errorElement.removeChild(errorTextNode);
                }
                this.#dropToken(column);
            } else if (error === GameError.COMPLETED_COLUMN) {
                if (!errorElement.hasChildNodes()) {
                    const errorTextNode = document.createTextNode("Column is Full");
                    errorElement.appendChild(errorTextNode);
                }
            } else {
                throw new Error("unexcpected error on column validation");
            }
        }
    }

    visitRandomPlayer(randomPlayer) {
        const column = randomPlayer.getRandomColumn();
        setTimeout(() => { this.#dropToken(column); }, 400);
    }

    #dropToken(column) {
        this.#getActivePlayer().dropToken(column);
        this._disable();
        this.#printBoard();
        const turn = this._getTurn();
        if (!turn.isLast()) {
            turn.next();
            this.#play();
        } else {
            let resultTextNode;
            if (turn.isWinner()) {
                const name = this.#getActivePlayer().getName().toLowerCase();
                resultTextNode = document.createTextNode(name + " win!!!");
            } else {
                resultTextNode = document.createTextNode("You've tied");
            }
            document.getElementById("resultInfo").appendChild(resultTextNode);
            this._disable();
            this._enableNexts();
        }
    }

    #printBoard() {
        const cellsElements = document.querySelectorAll('#board td');
        for (let cellElement of cellsElements) {
            const coordinate = new Coordinate(
                Number.parseInt(cellElement.getAttribute('row')),
                Number.parseInt(cellElement.getAttribute('column')));
            const cellColow = this._getBoard().getColor(coordinate);
            cellElement.style.backgroundColor = (cellColow.getName() ?? "white").toLowerCase();
        }
    }

    #getActivePlayer() {
        return this._getTurn().getActivePlayer();
    }

    _disable() {
        super._disable();
        const turnInfoElement = document.getElementById("turnInfo");
        const turnTextNode = turnInfoElement.firstChild;
        if (turnTextNode) {
            turnInfoElement.removeChild(turnTextNode);
        }
    }
}