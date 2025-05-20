export class LogicEvents extends CustomEvent{

    static INITIAL = new LogicEvents("initial"); 
    static IN_GAME = new LogicEvents("inGame");    
    static OUT_GAME = new LogicEvents("outGame");
    static COLUMN_SELECTED = new LogicEvents("columnselected");
    
    constructor(typeName) {
        super(typeName, {bubbles: true});                
    }    

    next() {
        return new LogicEvents(this.type, this.detail);
    }
}