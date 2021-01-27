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
exports.Characters = void 0;
const type_graphql_1 = require("type-graphql");
const CommonColumn_1 = require("./CommonColumn");
const Sentences_1 = require("./Sentences");
const typeorm_1 = require("typeorm");
let Characters = class Characters extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Characters.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(type => CommonColumn_1.Common),
    __metadata("design:type", CommonColumn_1.Common)
], Characters.prototype, "character", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Characters.prototype, "variant", void 0);
__decorate([
    typeorm_1.ManyToMany(() => Sentences_1.Sentences, sentences => sentences.characters, { cascade: true }),
    typeorm_1.JoinTable({ name: 'character_sentence' }),
    __metadata("design:type", Array)
], Characters.prototype, "sentences", void 0);
Characters = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Characters);
exports.Characters = Characters;
