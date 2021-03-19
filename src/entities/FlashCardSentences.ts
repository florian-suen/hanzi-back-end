import { ObjectType, Field } from "type-graphql";
import {Sentences} from './Sentences';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
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