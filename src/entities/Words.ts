import { ObjectType, Field } from "type-graphql";
import {Common, CharCollection} from './Common';
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    BaseEntity,
    OneToMany,
    ManyToMany,
    JoinTable,
  } from "typeorm";
import { Characters } from "./Characters";
import {Sentences} from './Sentences';

@ObjectType({implements:CharCollection})
@Entity()
export class Words extends BaseEntity implements CharCollection {
 
    @PrimaryGeneratedColumn()
    id!:number;

    @Column(type => Common)
    char_detail!:Common;

    @ManyToMany(type => Characters, characters=>characters.words)
    characters!:Characters;

    @JoinTable({name:'word_sentence'})
    @ManyToMany(type => Sentences, sentences=>sentences.words)
    sentences!:Sentences;

}
