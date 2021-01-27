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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
require("dotenv/config");
const Character_1 = require("./entities/Character");
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
        entities: [Character_1.Characters]
    }), (reason) => typeof reason === 'object' ? `Connection established but ${(reason.stack)}` : 'Critical error: Connection never established');
    return Connection;
};
const appGet = (app) => IO.of(app.get('/', (req, res) => { res.send('You have received a message'); }));
const appListen = (app) => IO.of(app.listen(parseInt(process.env.PORT), () => {
    C.log("server on localhost:4000")();
}));
function_1.pipe(IO.of(IO.of(express_1.default)()()), IO.chainFirst(appGet), IO.chainFirst(appListen))();
const logDBSuccess = TE.chainFirst(() => TE.of(C.log('Database Connection Success')()));
const logDBError = TE.mapLeft((error) => function_1.pipe(O.of(error), O.chainFirst((error) => O.of(C.log(error)()))));
const logDBConnection = function_1.flow(logDBSuccess, logDBError);
function_1.pipe(dbConnect(), TE.chainFirst((connection) => TE.of(connection.connect())), logDBConnection)();
const db = typeorm_1.getConnection();
const repo = db.getRepository(Character_1.Characters);
