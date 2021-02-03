import {
  createUnionType,
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root} from 'type-graphql';
import {createQueryBuilder, Like } from "typeorm";
import {Characters} from '../entities/Characters'
import {Sentences} from '../entities/Sentences'
import {Words} from '../entities/Words'
import {CharCollection} from '../entities/Common'
import * as TE from 'fp-ts/lib/TaskEither';
import * as IO from 'fp-ts/lib/IO';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import TEconcat from '../utility/te-semigroup';

function createQuery(searchArray:string[],cnIndexArray:boolean[]){
  let character =''; 
  let pinyin ='';
  let searchLength = searchArray.length;
  for (let i = 0; i < searchLength; i+=1){
  if (cnIndexArray[i]){
   character = character.concat(`%${searchArray[i]}`)
  }
  else {
    searchArray[i] ? pinyin = pinyin.concat(`%${searchArray[i]}`) : null;
  };
  };
  
   return character ? 
   pinyin ? {char_detail:{character:Like(`${character}%`), pinyin:Like(`${pinyin}%`)}} 
    : {char_detail:{character:Like(`${character}%`)}} 
    : pinyin ? {char_detail:{pinyin:Like(`${pinyin}%`)}} : null;
};




 

function searchDB(chars:string[]){
 
  const searchCharacters = chars;
  const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
  const arrayIsChineseIndex = searchCharacters.map((v)=>REGEX_CHINESE.test(v));
  const position = (function(){
    let _primaryPos = 0;
    let _secondaryPos = 1;
    const resetSecondary = ():void=>{_secondaryPos = (_primaryPos + 1)};
    const incrementPrimary = ()=>{
      if(_secondaryPos - _primaryPos >= 2){
    return _primaryPos = _secondaryPos - 1;
      }else{
   _primaryPos+=1}}
    const incrementSecondary = ()=>_secondaryPos+=1;
    const getPosition = (sec:Boolean = false) =>{
if(sec){
return _secondaryPos;
}
return _primaryPos;
    }
    return {
      resetPos:resetSecondary,
      incPrimary:incrementPrimary,
      incSecondary:incrementSecondary,
      getPos:getPosition
    }
  })()
 


  return (function findCharRecursion (results:CharCollection[] = []){ 
  
  const rerunSearch = (x:CharCollection[]):TE.TaskEither<unknown,CharCollection[]> => {

    if(!x.length){
     position.incPrimary();
     position.resetPos()
     return searchCharacters.length > position.getPos() ? findCharRecursion(x) : TE.of(x);
    }
    else {
    position.incSecondary();
    return searchCharacters.length >= position.getPos(true)? findCharRecursion(x) : TE.of(x);

    }
  
  }
  const searchArray = searchCharacters.slice(position.getPos(),position.getPos(true));
  const chineseIndex = arrayIsChineseIndex.slice(position.getPos(),position.getPos(true));
  const query = createQuery(searchArray,chineseIndex);
  const searchQuery = (query:object|null)=>query ? Characters.find(query) : Promise.reject('Search query empty');
  const queryDB = TE.tryCatchK(searchQuery,(reason)=>'findChar Resolver search error');

  
  return pipe(query,queryDB,TE.orElse<string,CharCollection[],never>((error)=>TE.of([])),TE.chain(rerunSearch),TEconcat(TE.of(results)));
  

  })()





};

export class CharacterResolver {
  @Query(returns => [CharCollection])
    async findChar(@Arg('char', type => [String])char:string[] ):Promise<CharCollection[]> {
 
    const charCollection: CharCollection[] = []; 
    const searchResults = await searchDB(char)();
    pipe(searchResults,E.map((v)=>charCollection.push(...v)));
    return charCollection;
 
  }
}

