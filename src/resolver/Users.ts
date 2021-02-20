import {Arg, Query, Resolver, Ctx, Mutation, createUnionType} from 'type-graphql';
import {validator} from '../utility/validator';
import myContext from '../types/context';
import {Users} from '../entities/Users'
import {hash, verify} from 'argon2';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import { flow, pipe, identity } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import {RegInputs,LoginInputs} from './input-types/UsersInputs';
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
  @Query(returns => Users,{nullable:true})
  async isLogged(@Ctx(){req}:myContext) {
    return req.session.userId ? Users.findOne(req.session.userId) : null;
  }

  @Query(returns => regResponse)
  async login(@Arg('logInputs')logInputs:LoginInputs, @Ctx(){req}:myContext):Promise<typeof regResponse> {
  const validationResults = await validator(logInputs);
  if (validationResults.responses[0]) { 
    return validationResults;
    }
    
   const findUser = TE.tryCatch(()=>Users.findOne({where:{username:logInputs.username}}),error=>`findUser login Error: ${((error as Error).stack)}`);
   const checkPassword = (user:Users|undefined):T.Task<Users|null> => async () => user ? await verify(user.password,logInputs.password) ? user : null : null;
   const findError = (error:string)=> T.of({type:'Finduser database Error', message:error});
   const handleFind = (val:T.Task<Users|null>) => pipe(val,T.map((v)=> v ? v : {type:'No Match', message:'There are no users that matches with the details you have entered'} ));
   
   return await pipe(findUser,TE.map(checkPassword),TE.fold<string,T.Task<null|Users>,DatabaseError|Users>(findError,handleFind))()
 }

  @Mutation(returns => regResponse)
  async register(@Arg('regInputs')regInputs:RegInputs,@Ctx(){req}:myContext):Promise<typeof regResponse> {
  const validationResults = await validator(regInputs);
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
  const insertUser = await TE.tryCatch(insertNewUser,handleError)()
  const handleResults = E.fold<DatabaseError,Users,DatabaseError|Users>(identity,(val) => {
    req.session.userId = val.id;
    return val});
  return pipe(insertUser,handleResults);
  }
}

