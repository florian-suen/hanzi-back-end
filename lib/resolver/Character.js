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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.CharacterResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Characters_1 = require("../entities/Characters");
const Common_1 = require("../entities/Common");
const TE = __importStar(require("fp-ts/lib/TaskEither"));
const E = __importStar(require("fp-ts/lib/Either"));
const pipeable_1 = require("fp-ts/lib/pipeable");
const te_semigroup_1 = __importDefault(require("../utility/te-semigroup"));
function createQuery(searchArray, cnIndexArray) {
    let character = '';
    let pinyin = '';
    let searchLength = searchArray.length;
    for (let i = 0; i < searchLength; i += 1) {
        if (cnIndexArray[i]) {
            character = character.concat(`%${searchArray[i]}`);
        }
        else {
            searchArray[i] ? pinyin = pinyin.concat(`%${searchArray[i]}`) : null;
        }
        ;
    }
    ;
    return character ?
        pinyin ? { char_detail: { character: typeorm_1.Like(`${character}%`), pinyin: typeorm_1.Like(`${pinyin}%`) } }
            : { char_detail: { character: typeorm_1.Like(`${character}%`) } }
        : pinyin ? { char_detail: { pinyin: typeorm_1.Like(`${pinyin}%`) } } : null;
}
;
function searchDB(chars) {
    const searchCharacters = chars;
    const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    const arrayIsChineseIndex = searchCharacters.map((v) => REGEX_CHINESE.test(v));
    const position = (function () {
        let _primaryPos = 0;
        let _secondaryPos = 1;
        const resetSecondary = () => { _secondaryPos = (_primaryPos + 1); };
        const incrementPrimary = () => {
            if (_secondaryPos - _primaryPos >= 2) {
                return _primaryPos = _secondaryPos - 1;
            }
            else {
                _primaryPos += 1;
            }
        };
        const incrementSecondary = () => _secondaryPos += 1;
        const getPosition = (sec = false) => {
            if (sec) {
                return _secondaryPos;
            }
            return _primaryPos;
        };
        return {
            resetPos: resetSecondary,
            incPrimary: incrementPrimary,
            incSecondary: incrementSecondary,
            getPos: getPosition
        };
    })();
    return (function findCharRecursion(results = []) {
        const rerunSearch = (x) => {
            if (!x.length) {
                position.incPrimary();
                position.resetPos();
                return searchCharacters.length > position.getPos() ? findCharRecursion(x) : TE.of(x);
            }
            else {
                position.incSecondary();
                return searchCharacters.length >= position.getPos(true) ? findCharRecursion(x) : TE.of(x);
            }
        };
        const searchArray = searchCharacters.slice(position.getPos(), position.getPos(true));
        const chineseIndex = arrayIsChineseIndex.slice(position.getPos(), position.getPos(true));
        const query = createQuery(searchArray, chineseIndex);
        const searchQuery = (query) => query ? Characters_1.Characters.find(query) : Promise.reject('Search query empty');
        const queryDB = TE.tryCatchK(searchQuery, (reason) => 'findChar Resolver search error');
        return pipeable_1.pipe(query, queryDB, TE.orElse((error) => TE.of([])), TE.chain(rerunSearch), te_semigroup_1.default(TE.of(results)));
    })();
}
;
class CharacterResolver {
    findChar(char) {
        return __awaiter(this, void 0, void 0, function* () {
            const charCollection = [];
            const searchResults = yield searchDB(char)();
            pipeable_1.pipe(searchResults, E.map((v) => charCollection.push(...v)));
            return charCollection;
        });
    }
}
__decorate([
    type_graphql_1.Query(returns => [Common_1.CharCollection]),
    __param(0, type_graphql_1.Arg('char', type => [String])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CharacterResolver.prototype, "findChar", null);
exports.CharacterResolver = CharacterResolver;
