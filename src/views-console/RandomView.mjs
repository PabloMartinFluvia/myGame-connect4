import { Coordinate } from "../models/Coordinate.mjs";

import { PlayerView } from "./PlayerView.mjs";
import { Message } from "./Message.mjs";
import { consoleMPDS } from "./Console.mjs";

export class RandomView extends PlayerView{

    constructor(player) {
        super(player);
    }

    readColumn() {
        let column;
        do {                  
            column = Coordinate.getRandomColumn();                      
        } while (this.isComplete(column));
        const msg = Message.RANDOM_COLUMN.toString().replace(`#value`, column + 1);
        consoleMPDS.writeln(msg);
        return column;
    }
}