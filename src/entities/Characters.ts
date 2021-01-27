import { ObjectType, Field } from "type-graphql";
import {Common, CharCollection} from './Common';
import {Sentences} from './Sentences';
import {Words} from './Words';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";

@ObjectType({implements:CharCollection})
@Entity()
export class Characters extends BaseEntity implements CharCollection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column(type => Common)
  char_detail!:Common

  @Column()
  variant!: string;

 @ManyToMany(()=>Sentences, sentences=>sentences.characters,{cascade:true})
 @JoinTable({name:'character_sentence'})
 sentences!:Sentences[];

@ManyToMany(()=>Words, words=>words.characters,{cascade:true})
@JoinTable({name:'character_word'})
 words!:Words[];







}