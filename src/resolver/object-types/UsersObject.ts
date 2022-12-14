import { IsNotEmpty, maxLength } from 'class-validator';

import { field } from 'fp-ts';
import {Field,ObjectType,InterfaceType, createUnionType} from 'type-graphql';

@InterfaceType({resolveType:val=>{
    if('property' in val){
      return ValidationErrors;
    }
    if('type' in val){
      return DatabaseError;
    }
    return null;
  }}) 
  
  abstract class ErrorResponse {
  @Field()
  message!:string;
  }
 
  abstract class Constraint {
  isLength?:string;
  isEmail?:string; 
  isNotEmpty?:string; 
  isMaxLength?:string;
  matches?:string;
}

@ObjectType()
class UserConstraint implements Constraint {
@Field({nullable:true})
  maxLength?:string;
@Field({nullable:true})
  isNotEmpty?:string;
}
@ObjectType()
abstract class PasswordConstraint implements Constraint {
  @Field({nullable:true})
  isLength?:string;
  @Field({nullable:true})
  isNotEmpty?:string;
  @Field({nullable:true})
  matches?:string;
}
@ObjectType()
abstract class EmailConstraint implements Constraint {
  @Field({nullable:true})
  isEmail?:string;
  @Field({nullable:true})
  isNotEmpty?:string;
}


  abstract class ValidationResp {
  property?:string;
  constraints?:UserConstraint|PasswordConstraint|EmailConstraint;
  }
   


@ObjectType()
class UserValidation implements ValidationResp{
@Field()
property?:string;
@Field(()=>UserConstraint)
constraints?:UserConstraint
}

@ObjectType()
class PasswordValidation implements ValidationResp{
@Field()
property?:string
@Field(()=>PasswordConstraint)
constraints?:PasswordConstraint;
}

@ObjectType()
class EmailValidation implements ValidationResp{
@Field()
property?:string
@Field(()=>EmailConstraint)
constraints?:EmailConstraint;
}

  const ValidationResponse = createUnionType({name:'ValidationResponse',types:()=>[UserValidation,PasswordValidation,EmailValidation] as const, resolveType:(val)=>{
    if(val.property === 'username')
    { return UserValidation }
    if(val.property === 'password')
    { return PasswordValidation }
    if(val.property === 'email')
    { return EmailValidation }
    return undefined;
    }})
    





  @ObjectType({implements:ErrorResponse})
  class ValidationErrors extends ErrorResponse {
  @Field(()=>[ValidationResponse])
  responses!: typeof ValidationResponse[]
  }
  
  @ObjectType({implements:ErrorResponse}) 
  class DatabaseError extends ErrorResponse {
  @Field()
  type!:string;
  }

  export {DatabaseError,ValidationErrors}  