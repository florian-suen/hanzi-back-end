import { ObjectType, Field } from "type-graphql";
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
    ManyToOne,
  } from "typeorm";
import { Flashcards } from "./Flashcards";
import { FlashcardSentences } from "./FlashCardSentences";
import { FlashcardWords } from "./FlashCardWords";
 

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

    @Field(()=>[Flashcards])
    @OneToMany(()=> Flashcards, flashcards=>flashcards.users)
    flashcards!:Flashcards[];

    @Field(()=>[FlashcardWords])
    @OneToMany(()=> FlashcardWords, flashcardwords=>flashcardwords.users)
    flashcardwords!:FlashcardWords[];

    @Field(()=>[FlashcardSentences])
    @OneToMany(()=> FlashcardSentences, flashcardsentences=>flashcardsentences.users)
    flashcardsentences!:FlashcardSentences[];

}

