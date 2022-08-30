import {ObjectType, Field } from "type-graphql";
import {Common, CharCollection} from './Common';
import {Characters} from './Characters';
import {Words} from './Words';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { FlashcardSentences } from "./FlashCardSentences";

@ObjectType({implements:CharCollection})
@Entity()
export class Sentences extends BaseEntity implements CharCollection {

@PrimaryGeneratedColumn()
id!:number;
  
@Column(type => Common)
char_detail!:Common;
  
@Field()
@Column()
chengyu?: Boolean

@ManyToMany(()=>Characters, characters=> characters.sentences)
characters!:Characters[]

@ManyToMany(type => Words, words => words.sentences)
words!:Words;

@OneToMany(()=>FlashcardSentences, flashcards=>flashcards.sentences)
flashcards!: FlashcardSentences[];


}