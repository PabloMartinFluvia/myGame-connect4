import { Coordinate } from "../models/Coordinate.mjs";

import { PlayerView } from "./PlayerView.mjs";
import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

export class UserView extends PlayerView {

    constructor(player) {
        super(player);
    }

    readColumn() {
        let column;
        let valid = false;
        do {            
            column = consoleMPDS.readNumber(Message.ENTER_COLUMN_TO_DROP.toString()) - 1;            
            if (!Coordinate.isColumnValid(column)) {
                Message.INVALID_COLUMN.writeln();
            } else if (this.isComplete(column)) {
                Message.COMPLETED_COLUMN.writeln();
            } else {
                valid = true;
            }
        } while (!valid);
        return column;
    }
    
}