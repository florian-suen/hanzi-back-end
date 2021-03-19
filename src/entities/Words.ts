import { ObjectType } from "type-graphql";
import {Common, CharCollection} from './Common';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToMany,
    JoinTable,OneToMany,
  } from "typeorm";
import { Characters } from "./Characters";
import {Sentences} from './Sentences';
import { FlashcardWords } from "./FlashCardWords";

@ObjectType({implements:CharCollection})
@Entity()
export class Words extends BaseEntity implements CharCollection {
@PrimaryGeneratedColumn()
id!:number;

@Column(type => Common)
char_detail!:Common;

@ManyToMany(type => Characters, characters=>characters.words)
characters!:Characters;

@Column({nullable:true,default:true})
word?:boolean;

@JoinTable({name:'word_sentence'})
@ManyToMany(type => Sentences, sentences=>sentences.words)
sentences!:Sentences;


@OneToMany(()=>FlashcardWords, flashcardwords=>flashcardwords.words)
flashcardwords!: FlashcardWords[];
}
