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
 

export class CharacterResolver {
  private characterCollection: CharCollection[] = [];
  @Query(returns => [CharCollection])
    findChar(@Arg("char")char:string[] ):CharCollection[] {

    const charCollection: CharCollection[] = [];
    const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    const HAS_CHINESE_CHAR = REGEX_CHINESE.test;

    function createQuery(searchArray:string[],cnIndexArray:boolean[]){
      const chinese = {character:''}; 
      const english = {pinyin:''};
      for (let i = 0; i <= searchArray.length; i=+1){
      if (cnIndexArray[i]){
        chinese.character.concat(`%${searchArray[i]}`)
      }
      else {
        english.pinyin.concat(`%${searchArray[i]}`)
      };
      };
  
       return chinese.character ? 
       english.pinyin ? {char_detail:{character:Like(chinese.character), pinyin:Like(english.pinyin)}} 
        : {char_detail:{character:Like(chinese.character)}} 
        : {char_detail:{pinyin:Like(english.pinyin)}}
    }
  
    function searchDB(chars:string[],searchChars:string[] = []){
      const charactersArray = chars;
      const searchCharacters = searchChars;
      const addCharToSearch = IO.of(()=>searchCharacters.push(charactersArray.shift()!));
      charactersArray[0] && addCharToSearch()();    

      const arrayIsChineseIndex = searchCharacters.map(HAS_CHINESE_CHAR);
      const results:CharCollection[] = [];
      const QUERY = createQuery(searchCharacters,arrayIsChineseIndex);
      

      const queryDB = TE.tryCatchK((query:any)=>Characters.find(query),(reason)=>`findChar Resolver error:${(reason as Error).stack}`)
      const addCharArray = (value:E.Either<never, Characters[]>) => pipe(value,E.map((v)=>results.push(...v)))
    
      pipe(QUERY,queryDB,TE.orElse<string,Characters[],never>((error)=>TE.of([])))().then(addCharArray);

     
      //return charactersArray ? searchDB() : results;

  };


  
    return charCollection;
 
  }
}