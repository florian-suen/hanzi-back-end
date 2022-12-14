import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection, Connection } from "typeorm";
import "dotenv/config";
import { Users } from "./entities/Users";
import { Characters } from "./entities/Characters";
import { Flashcards } from "./entities/Flashcards";
import { CharacterResolver } from "./resolver/CharactersResolver";
import { UserResolver } from "./resolver/UsersResolver";
import { Sentences } from "./entities/Sentences";
import { Words } from "./entities/Words";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe, flow } from "fp-ts/lib/function";
import * as C from "fp-ts/lib/Console";
import * as IO from "fp-ts/lib/IO";
import * as O from "fp-ts/lib/Option";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session";
import cors from "cors";
import { FlashcardWords } from "./entities/FlashCardWords";
import { FlashcardSentences } from "./entities/FlashCardSentences";

//synch
const dbConnect = (
  url = process.env.DB_HOST || process.env.DBURL
): TE.TaskEither<string, Connection> => {
  console.log(url);
  const connect = TE.tryCatch(
    () =>
      createConnection({
        type: "postgres",
        url: url,
        synchronize: true,
        logging: true,
        entities: [
          FlashcardWords,
          FlashcardSentences,
          Flashcards,
          Words,
          Characters,
          Sentences,
          Users,
        ],
      }),
    (error) =>
      typeof error === "object"
        ? `Connection error: ${(error as Error).stack}`
        : "Critical error: Connection never established"
  );

  return connect;
};

const logDBSuccess = TE.chainFirst<string, Connection, void>(() =>
  TE.of(C.log("Database Connection Success")())
);
const logDBError = TE.mapLeft<string, O.Option<string>>((error) =>
  pipe(
    O.of(error),
    O.chainFirst((error) => O.of(C.log(error)()))
  )
);
const logDBConnection = flow(logDBSuccess, logDBError);

pipe(dbConnect(), logDBConnection)();

const app = IO.of(express);

const appCors = (app: express.Application) =>
  IO.of(
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
      })
    )
  );

let RedisStore = connectRedis(session);
//{host: 'redis'}
let redis = new Redis({ host: "redis" });

const appUseRedis = (app: express.Application) =>
  IO.of(
    app.use(
      session({
        name: "ceid",
        store: new RedisStore({ client: redis, disableTouch: true }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365,
          httpOnly: true,
          sameSite: true,
          secure: !process.env.__PROD__,
        },
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
      })
    )
  );
const appGet = (app: express.Application) =>
  IO.of(
    app.get("/", (req, res) => {
      res.send("You have received a message");
    })
  );
const appListen = (app: express.Application) =>
  IO.of(
    app.listen(parseInt(process.env.PORT!), () => {
      C.log("server on localhost:4000")();
    })
  );

const connectApollo = async (app: express.Application) => {
  const schema = await buildSchema({
    resolvers: [UserResolver, CharacterResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    introspection: true,
    playground: true,
    schema: schema,
    context: ({ req, res }) => ({ req, res, redis }),
  });
  apolloServer.applyMiddleware({ app, cors: false });
};

pipe(
  app()(),
  IO.of,
  IO.chainFirst(appCors),
  IO.chainFirst(appUseRedis),
  IO.chainFirst(appGet),
  TE.fromIO,
  TE.chainFirst(flow(connectApollo, TE.of)),
  TE.map(appListen)
)();
