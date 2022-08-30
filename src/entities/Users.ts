import { ObjectType, Field } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    BaseEntity,
    OneToMany,
  } from "typeorm";
import { Flashcards } from "./Flashcards";
import { FlashcardSentences } from "./FlashCardSentences";
import { FlashcardWords } from "./FlashCardWords";
import {flashResponse} from '../resolver/UsersResolver'

@Entity()
@ObjectType()
export class Users extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!:number;
  
    @Field()
    @Column({ unique: true })
    username!:string;
  
    @Field()
    @Column({ unique: true })
    email!:string;
  

    @Column()
    password!:string;
  
    @Field()
    @CreateDateColumn()
    createdAt!: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt!: Date;

    @Field(()=>[flashResponse],{nullable:false})
    flashcard!:[typeof flashResponse];

    
    @OneToMany(()=> Flashcards, flashcards=>flashcards.users)
    flashcards!:Flashcards[];

    @OneToMany(()=> FlashcardWords, flashcardwords=>flashcardwords.users)
    flashcardwords!:FlashcardWords[];
    
    @OneToMany(()=> FlashcardSentences, flashcardsentences=>flashcardsentences.users)
    flashcardsentences!:FlashcardSentences[];

}

