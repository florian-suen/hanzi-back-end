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
}

