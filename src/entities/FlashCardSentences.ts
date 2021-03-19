import { ObjectType, Field } from "type-graphql";
import {Common, CharCollection} from './Common';
import {Sentences} from './Sentences';
import {Words} from './Words';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToMany,
  ManyToOne,
  JoinTable,
  Index
} from "typeorm";
import { Characters } from "./Characters";
import { Users } from "./Users";

@Entity()
@ObjectType()
export class FlashcardSentences extends BaseEntity{ 
@PrimaryGeneratedColumn()
id!: number;

@Field({nullable:true})
@Column()
passed?:boolean;

@Field(()=>Sentences, {nullable:true})
@ManyToOne(() => Sentences, sentences => sentences.flashcards )
sentences!: Sentences;

@ManyToOne(() => Users, users => users.flashcards)
users!: Users;
}