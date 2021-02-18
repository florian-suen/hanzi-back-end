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
exports.Words = void 0;
const type_graphql_1 = require("type-graphql");
const Common_1 = require("./Common");
const typeorm_1 = require("typeorm");
const Characters_1 = require("./Characters");
const Sentences_1 = require("./Sentences");
let Words = class Words extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Words.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(type => Common_1.Common),
    __metadata("design:type", Common_1.Common)
], Words.prototype, "char_detail", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Characters_1.Characters, characters => characters.words),
    __metadata("design:type", Characters_1.Characters)
], Words.prototype, "characters", void 0);
__decorate([
    typeorm_1.JoinTable({ name: 'word_sentence' }),
    typeorm_1.ManyToMany(type => Sentences_1.Sentences, sentences => sentences.words),
    __metadata("design:type", Sentences_1.Sentences)
], Words.prototype, "sentences", void 0);
Words = __decorate([
    type_graphql_1.ObjectType({ implements: Common_1.CharCollection }),
    typeorm_1.Entity()
], Words);
exports.Words = Words;
