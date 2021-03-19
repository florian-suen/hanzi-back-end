import { ObjectType, Field } from "type-graphql";
import {Common, CharCollection} from './Common';
import { Flashcards } from "./Flashcards";
import {Sentences} from './Sentences';
import {Words} from './Words';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";

@ObjectType({implements:CharCollection})
@Entity()
export class Characters extends BaseEntity implements CharCollection {
@PrimaryGeneratedColumn()
id!:number;

@Column(type => Common)
char_detail!:Common;

@Field({nullable:true})
@Column({nullable:true})
variant?: string;

@ManyToMany(()=>Sentences, sentences=>sentences.characters,{cascade:true})
@JoinTable({name:'character_sentence'})
sentences!:Sentences[];

@ManyToMany(()=>Words, words=>words.characters,{cascade:true})
@JoinTable({name:'character_word'})
words!:Words[];

@JoinTable()
@OneToMany(()=>Flashcards, flashcards=>flashcards.characters)
flashcards!: Flashcards[];
}