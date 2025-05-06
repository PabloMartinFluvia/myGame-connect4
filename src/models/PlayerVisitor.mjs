import { assert } from "../utils/assert.mjs";

export class PlayerVisitor {

    visitUserPlayer(userPlayer) {assert(false, 'abstract')}

    visitRandomPlayer(randomPlayer) {assert(false, 'abstract')}
}