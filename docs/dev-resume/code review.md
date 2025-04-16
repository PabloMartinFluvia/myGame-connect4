# Problem solved in this commit

## Problem

## Solution

## Ideas to consider in the future

- #isResumed() in Connect4: method returns a value AND changes states (.reset methods). NO minimum surprise principle and NO cohesion.

- write(color) in ColorView: writes a string according to the full length of the board's cell.

- readColumn() in PlayerView: use LimitedIntDialog to request a valid number.

- reset() in Turn only needs to reset the activePlayer, there's no need to create new players.

- Turn has low cohesion: there's none method wich uses all atributes (only in reset, but with the change done in the previous point won't be any) -> Remove association from Turn to Board?

- Player is a lazy class?

- getShifted(coordinates, direction) don't need any board's attribute -> maybe another class is needed? -> class Line, associting origin with lastDrop

- Message.INVALID_COLUMN has magic numbers

- Add asserts

- Game and GameView?

- Notes:
    - In Message.PLAYER_WIN replaced #color to #winner. And value is showed in singular.
    
    - isFinished() in Board removed, due it's not primitive.

    - isOccupied(coordinate, color) removed (unnecesary)

    - fixed magic number 4 in Board

    - isWinner(), isConnect4() and getShifted() in Board refactored.

    - line class added

    - removed unnecesary directions



# TODOs in code review
1. Simplicity:
    - Anybody will understand the code? Can be less complex?
2. Legibility:
    - Identifiers indicate their intent? Can be more expressive?
    - Code is consistent with the choosed patterns?
    - There's a coherent pattern for the order of the members in any class? Are related near?
    - There's dead code?
    - There's reapeated code?
    - It's the minimum essential code needed to implement the required functionalities? There's code not needed or complex without need?
4. Domain Model:
    - Indentifiers respect client's vocabulary?    
5. Modular Design:
    - The types of relations established are coherent with the characteristics of the collaboration?
    - Any *module* has his existence justified? Always would be a dessign problem if any *module* were removed and its responsibilities reassigned to any existing *module*?
    - For each *module* its responsabilites of know/do are related to the *concept* that it represents? 
    - The assigment of responsabilities between *modules* is balanced?
    - Each process it's in the *module* which has the *essential* data for the process?
    - The interface of any *module* is primitive?
    - High Cohesion:
        - All responsabilities of any *module* are strongly related?
        - It's possible to define the *module*'s global responsibility in **one single *concept***? There's no *module* wich requires more than one *concept* to define it's global responsibility?
        - Any *module* has just one reason for change? **Only would change** if changes the *concept* wich defines it's global responsibility?
        - Any change would affect only one *module*?    
    - Low Coupling:
        - The number of dependencies of any *module* is not big? They're easy to understand and remember?
        - Any *module* is uncoupled to the implementation of its *servers modules*? 
        - In any *module*: the number of dependencies is inversely proportional to the number of potentially unstable dependencies? (the more number of potential unstable dependencies, the less total number of dependencies).
        - There's no relations cycles between *modules*?
        - Any *module* only collaborates with its direct dependencies?
    - Low Granurality:
        - Any *module* is small?
        - Any *module*'s metrics are <= to the (orientative) recomended?
6. Design by Contract:
    - Any *module* is self-protected?
    - Defensive programing is avoided?
    - In any process: the pre-conditions to execute well the process are checked?
    - In any critical / not trivial process, where the object's state is modified: the process has checked the object's invariant?