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
 
@Entity()
export class Users extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!:number;
  
    @Field()
    @PrimaryGeneratedColumn()
    username!:string;
  
    @Field()
    @PrimaryGeneratedColumn()
    email!:string;
  
    @Field()
    @PrimaryGeneratedColumn()
    password!:number;
  

}

