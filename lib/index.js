"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
require("dotenv/config");
const Characters_1 = require("./entities/Characters");
const Character_1 = require("./resolver/Character");
const Sentences_1 = require("./entities/Sentences");
const Users_1 = require("./entities/Users");
const Words_1 = require("./entities/Words");
const TE = __importStar(require("fp-ts/lib/TaskEither"));
const function_1 = require("fp-ts/lib/function");
const C = __importStar(require("fp-ts/lib/Console"));
const IO = __importStar(require("fp-ts/lib/IO"));
const O = __importStar(require("fp-ts/lib/Option"));
const dbConnect = (url = process.env.DBURL) => {
    const Connection = TE.tryCatch(() => typeorm_1.createConnection({
        type: 'postgres',
        url: url,
        synchronize: true,
        logging: true,
        entities: [Characters_1.Characters, Sentences_1.Sentences, Users_1.Users, Words_1.Words]
    }), (reason) => typeof reason === 'object' ? `Connection established but error: ${(reason.stack)}` : 'Critical error: Connection never established');
    return Connection;
};
const logDBSuccess = TE.chainFirst(() => TE.of(C.log('Database Connection Success')()));
const logDBError = TE.mapLeft((error) => function_1.pipe(O.of(error), O.chainFirst((error) => O.of(C.log(error)()))));
const logDBConnection = function_1.flow(logDBSuccess, logDBError);
function_1.pipe(dbConnect(), logDBConnection)();
const app = IO.of(express_1.default);
const appGet = (app) => IO.of(app.get('/', (req, res) => { res.send('You have received a message'); }));
const appListen = (app) => IO.of(app.listen(parseInt(process.env.PORT), () => {
    C.log("server on localhost:4000")();
}));
const connectApollo = (app) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = yield type_graphql_1.buildSchema({
        resolvers: [Character_1.CharacterResolver],
        validate: false,
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({ introspection: true, playground: true,
        schema: schema
    });
    apolloServer.applyMiddleware({ app, cors: false });
});
function_1.pipe(app()(), IO.of, IO.chainFirst(appGet), TE.fromIO, TE.chainFirst(function_1.flow(connectApollo, TE.of)), TE.map(appListen))();
