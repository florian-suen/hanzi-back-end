import {Arg, Query, Resolver, Ctx, Mutation, createUnionType} from 'type-graphql';
import {validate,ValidationError } from 'class-validator';
import myContext from '../types/context';
import {Users} from '../entities/Users'
import {hash} from 'argon2';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe, identity } from 'fp-ts/lib/function';

import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import {regInputs} from './input-types/UsersInputs';
import {DatabaseError,ValidationErrors} from './object-types/UsersObject';
 

interface NodeError extends NodeJS.ErrnoException { 
detail:string;
}

const regResponse = createUnionType({name:'regResponse',types:()=>[Users,DatabaseError,ValidationErrors] as const, resolveType:(val)=>{
if('responses' in val)
{ return ValidationErrors }
if('type' in val)
{ return DatabaseError }
if('username' in val)
{ return Users }
return undefined;
}})

@Resolver(Users)
export class UserResolver {
/*   @Query(returns => Users , {nullable:true})
    async findUser(@Ctx(){req}:myContext):Promise<Users> {
   return new Users;
 
  } */
  @Mutation(returns => regResponse)
  async register(@Arg('regdetails')regInputs:regInputs,@Ctx(){req}:myContext):Promise<typeof regResponse> {
         
  const validationError:T.Task<ValidationError[]> = () => validate(regInputs); 
  const validationMapResponse = (val:ValidationError[])=>val && val.map((v)=>({property:v.property,constraints:v.constraints!})) 
  const validationResults = await pipe(validationError,T.map(validationMapResponse),T.map((val)=>({message:'Validation error', responses:val})))()
  if(validationResults.responses[0]) { 
  return validationResults;
  }
  
  const hashedPassword = await hash(regInputs.password);
  const insertNewUser = () => Users.create({username:regInputs.username,password:hashedPassword,email:regInputs.email}).save()
  const handleError = (error:unknown) => {
    const dbError = error as NodeError; 
    const COLUMNREGEX = /(?<=\()\w+/;
    const columnError = dbError.detail.match(COLUMNREGEX) 
    return dbError.code === '23505' ? {type:'duplicate', message:`${columnError![0]} already exists. Please choose another ${columnError![0]}`} : 
    {type:'default', message:'Registration Error'};
  } 
  const insertUser = await pipe(TE.tryCatch(insertNewUser,handleError))()
  const handleResults = E.fold<DatabaseError,Users,DatabaseError|Users>(identity,(val) => {
    req.session.userId = val.id;
    return val});
  return pipe(insertUser,handleResults);
  }
}

