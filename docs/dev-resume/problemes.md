- no m'agrada que se li tingui que passar el color a board quan se li pregunta per si hi ha connect4. No es podria evitar passar-li el argument? I que ell ja sàpiga quin color ha de buscar (o que busqui en els 2 colors)?

- Cal que game depengui de colors? S'usa en:
    - inicialitzar els players
    - preguntar al player actiu quin color es, per a preguntar al board si hi ha connect4 d'aquell color.
    - cal que Player tingui el mètode getColor?

- Cal que el Game inicialitzi els players i els asocii a un color? No podría fer-ho el turn?

- Lo que el Game pregunta a un player o al board se li podría preguntar al turn (i que ell ho deleges), per així reduïr el número de dependencies de Game? 
    - NO vui reduïr per reduïr, cal que tingui un problema & "preguntar al Turn no perjudiqui que qualsevol persona ho pugui entendre" <-> que ningú es pugui preguntar "per que collons se li pregunta això al turn?".

- Seria viable eliminar la clase Player i que el Turn osciles entre dos colors?

- al inicialitzar el turn, per a que tingui sentit, cal assertar que cada player dins del array de players no sigui null/undefined. Xo el turn no llança cap missatge a un player en concret. -> O fa peticions a algun player en concret o els inicialitza ell (i així no calgui assertar)

- hi ha un acoplament entre num players i l'enumerat de Color -> calcular el numPlayers en funció de Color

- Cal dir-li al board, al incialitzar-lo el numPlayers? No ho podria saber ell a partir de color?

- Propietats ROWS i COLUMNS del board no hauria de ser una propietat dels límits de qualsevol coordenada?