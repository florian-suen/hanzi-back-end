
import {Field,ObjectType,InterfaceType} from 'type-graphql';

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
   
  @ObjectType()
  abstract class Constraints {
  @Field()
  length?:string;
  @Field()
  isEmail?:string;
  @Field()
  isNotEmpty?:string;
  @Field()
  maxLength?:string;
  }
   
  @ObjectType()
  class ValidationResponse{
    @Field()
    property!: string;
    @Field(()=>Constraints)
    constraints!:Constraints;
  }
  
  @ObjectType({implements:ErrorResponse})
  class ValidationErrors extends ErrorResponse {
  @Field(()=>[ValidationResponse])
  responses!:ValidationResponse[]
  }
  
  @ObjectType({implements:ErrorResponse}) 
  class DatabaseError extends ErrorResponse {
  @Field()
  type!:string;
  }

  export {DatabaseError,ValidationErrors}  