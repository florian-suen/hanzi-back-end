import { ObjectType, Field } from "type-graphql";
import {Words} from './Words';
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
export class FlashcardWords extends BaseEntity{ 
@PrimaryGeneratedColumn()
id!: number;

@Field({nullable:true})
@Column()
passed?:boolean;

@Field(()=>Words,{nullable:true})
@ManyToOne(() => Words, words => words.flashcardwords )
words!: Words;

@ManyToOne(() => Users, users => users.flashcardwords)
users!: Users;
}