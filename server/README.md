# Bomberman Server

This is a server for playing a multiplayer Tic Tac Toe game. 

It has these endpoints:

* `POST /users`: sign up as new user
* `POST /logins`: log in and receive a JWT
* `POST /games`: create a new game (and join it automatically)
* `POST /games/:id/players`: join an existing game
* `POST /games/:id/bombs`: place a Bomb on the board, which after some time explodes, which creates an Explosion, which disappears after some time
* `POST /games/:id/flames`: spawn a Flame on the board, which will travel in a certain direction and then disappear
* `PATCH /games/:id`: update an existing game
* `PATCH /games/:id/start`: start a game that is still in pending status
* `PATCH /games/:id/players`: update the position on the board of your player
* `GET /games`: list all games
* `GET /users`: list all users

## Running

* You need a working Postgres database that is preferrably empty (drop all the tables) and running
  * Oh, and the current source code is using `postgres://postgres:secret@localhost:5432/postgres`, so port `5432`, username `postgres` and password `secret`
* Install the dependencies using `yarn install`
* Start the server using `nodemon .` (this automatically compiles the typescript and runs it)

### Known issues

A known issue is that upon starting the server, it gives a `QueryFailedError: column "user_id" specified more than once`.  
This was already the case in the project we got and this extra @Column field in the class is necessary due to a quirk in TypeORM.  
A way to deal with it is go to `./src/games/entities.ts` and comment out the lines:
```
@Column()
userId: number
```
...in the Player class, start the server, uncomment them and restart the server.