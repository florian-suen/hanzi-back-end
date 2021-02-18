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
Object.defineProperty(exports, "__esModule", { value: true });
const TaskEither_1 = require("fp-ts/lib/TaskEither");
const TE = __importStar(require("fp-ts/lib/TaskEither"));
const pipeable_1 = require("fp-ts/lib/pipeable");
const arraySemigroup = { concat: (x, y) => x.concat(y) };
const semiGroupCharColl = TaskEither_1.getSemigroup(arraySemigroup);
const duplicateCheck = (chars) => chars.filter((val, index, arr) => arr.findIndex(v => (v.char_detail.character === val.char_detail.character)) === index);
const concatTEChar = (x) => (y) => pipeable_1.pipe(semiGroupCharColl.concat(x, y), TE.map(duplicateCheck));
exports.default = concatTEChar;
