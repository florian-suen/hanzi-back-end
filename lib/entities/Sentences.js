"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sentences = void 0;
const type_graphql_1 = require("type-graphql");
const Common_1 = require("./Common");
const Characters_1 = require("./Characters");
const Words_1 = require("./Words");
const typeorm_1 = require("typeorm");
let Sentences = class Sentences extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Sentences.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(type => Common_1.Common),
    __metadata("design:type", Common_1.Common)
], Sentences.prototype, "char_detail", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], Sentences.prototype, "chengyu", void 0);
__decorate([
    typeorm_1.ManyToMany(() => Characters_1.Characters, characters => characters.sentences),
    __metadata("design:type", Array)
], Sentences.prototype, "characters", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Words_1.Words, words => words.sentences),
    __metadata("design:type", Words_1.Words)
], Sentences.prototype, "words", void 0);
Sentences = __decorate([
    type_graphql_1.ObjectType({ implements: Common_1.CharCollection }),
    typeorm_1.Entity()
], Sentences);
exports.Sentences = Sentences;
