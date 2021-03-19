import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne
} from "typeorm";
import { Characters } from "./Characters";
import { Users } from "./Users";

@Entity()
@ObjectType()
export class Flashcards extends BaseEntity{ 
@PrimaryGeneratedColumn()
id!: number;

@Field({nullable:true})
@Column()
passed?:boolean;

@Field({nullable:true})
@ManyToOne(() => Characters, characters => characters.flashcards )
characters!: Characters;
 
@ManyToOne(() => Users, users => users.flashcards)
users!: Users;
}