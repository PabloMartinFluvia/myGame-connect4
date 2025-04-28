# Problem solved in this commit

## Problem

## Solution

## Ideas to consider in the future

- In randomView.readColumn() : has some logic (4 first lines) wich could be done by models (player.getRandomColumn())

- In userView.readColumn() :
has validation logic. It makes more difficult the reusability of models (with other technology for views the validation must be written again). Propose in do-while body
    - do {
    - column = console.read
    - error = player.validate(column)
        - obs: error is enum model
    - if (!error.isNull())
        - errorView.write(error)
    - } while (!error.isNull()) 

- In settingView.#getNumUsers: idem validation problem. So delegate validation to static turn method:
    - error = Turn.validate(numUsers)
    - use errorView if error

- Analisis actual solution vs others:
    1. Actual: 
        - only one type of Player
        - 2 types of PlayerView. Each instance associated to one instance of Player.
        - clients of PlayerView (TurnView) use them polimorfically.
        - SettingView creates PlayerView deriveds instances + associate them to its models + provides them to clients.
        - Extra considerations in my solution:
            1. If, in the future, client request more types of "how obtain the column where drop the token", that would be a problem:
            2. Option A: write the logic in a new type of PlayerView -> if the techonology in/out changes that logic will be written again !!!
            3. Obtion B: write the logic in Player -> it would be a "potential monster": size grows and cohesion decreases.
    2. Other:
        - 2 types of Player
        - types of PlayerView, wich DO NOT use Player polimorfically. UserView --> User. RandomView --> Random.
            - In other case app won't work well.
        - clients of PlayerView (TurnView) use them polimorfically.
        - Extra considerations in the other specific solution:
            - Player derivateds break liskov:
                - Human returns more than expected in Base class
                - Random parameter is more restrict than Base class.
                - So clients CAN'T use them polimorfically -> inheritance implemented only for reusability
            - TurnView uses PlayerView polimorfically, but is coupled to derived classes.
            - TurnView creates instances of models
    3. Concolusion:
        1. Different types of Player 
        2. Deriveds specialized in validate AND / OR calulate the column where drop the tokens.
        3. Models use them polimorfically.
        4. Different types of PlayerView.
        5. Deriveds specialized in in/out data for their specifics models. So DO NOT USE THEM POLIMORFICALLY.
        6. Views use them polimorfically.
        7. Specific class (PlayerConfig) in models, to create instances of Player's deriveds, wich provides the Players to Models.
        8. Specific class (PlayerConfigView) in views, for in/out data for PlayerConfig and create instances of the derived views, wich provides the PlayersViews to Views.
        9. Error & ErrorView



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