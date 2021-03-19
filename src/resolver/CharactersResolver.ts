import {Arg, Query, Resolver,createUnionType} from 'type-graphql';
import {Characters} from '../entities/Characters'
import {Sentences} from '../entities/Sentences'
import {Words} from '../entities/Words'
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import TEconcat from '../utility/te-semigroup';
import {Options} from './input-types/CharsInputs'
import {getRepository} from "typeorm";

export const charResponse = createUnionType({name:'charResponse',types:()=>[Characters,Words,Sentences] as const, resolveType:(value)=>{
  if ('variant' in value) {
    return 'Characters';
  }

  if ('chengyu' in value) {
    return 'Sentences'; 
  }

  if ('word' in value) {
    return 'Words'; 
  }

return null;
  }})
  

const queryDB = (query:string[],options:string[],cnIndex:boolean[])=> 
  {
    const optLength = options.length;
    const optionList= {['characters' as string]:Characters, ['words' as string]:Words, ['sentences' as string]:Sentences};
    const taskArray = [];
    const searchCN = query.filter((v,i)=>cnIndex[i]);
    const searchPY = query.filter((v,i)=>!cnIndex[i]);
    const combineCN = searchCN.length > 1 ? searchCN.reduce((prev,next)=>{
      return `${prev}%${next}`;
    }) : searchCN[0];
    const combinePY =  searchPY.length > 1 ? searchPY.reduce((prev,next)=>{
      return `${prev}%${next}`;
    }) : searchPY[0];

    for(let i = 0; optLength > i; i+=1){
      if(searchCN.length > 0 && searchPY.length > 0 ) taskArray.push(TE.tryCatch<string, typeof charResponse[]>(()=>  getRepository(optionList[options[i]]).createQueryBuilder().where(`unaccent("charDetailCharacter") Like unaccent(:char)`,{char:`${combineCN}%`})
      .orWhere(`unaccent("charDetailPinyin") Like unaccent(:char)`,{char:`${combinePY}%`}).getMany(),(reason)=>'findChar Resolver search error')); 
  
      else if(searchCN.length > 0) taskArray.push(TE.tryCatch<string, typeof charResponse[]>(()=> getRepository(optionList[options[i]]).createQueryBuilder().where(`unaccent("charDetailCharacter") Like unaccent(:char)`,{char:`${combineCN}%`}).getMany(),(reason)=>'findChar Resolver search error')); 

      else if(searchPY.length > 0) taskArray.push(TE.tryCatch<string, typeof charResponse[]>(()=> getRepository(optionList[options[i]]).createQueryBuilder().where(`unaccent("charDetailPinyin") Like unaccent(:char)`,{char:`${combinePY}%`}).getMany(),(reason)=>'findChar Resolver search error')); 

    }

   return taskArray.length > 1 ? taskArray.reduce((prev,next)=>{
    return TEconcat(prev)(next);
   }) : taskArray[0];
  
  
  }

 
function searchDB(chars:string[],options:Options){
  const searchCharacters = chars;
  const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
  const arrayIsChineseIndex = searchCharacters.map((v)=>REGEX_CHINESE.test(v));
  let optionsArray:string[] = [] ;
  for(const [key,boolean] of Object.entries(options)){
    if (boolean) optionsArray.push(key);
  }

  const position = (function(){
    let _primaryPos = 0;
    let _secondaryPos = 1;
   
    
 
    const resetSecondary = ():void=>{_secondaryPos = (_primaryPos + 1)};
    const incrementPrimary = ()=>{
      if(_secondaryPos - _primaryPos >= 2){
    return _primaryPos = _secondaryPos - 1;
      } else{
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
 
  return (function findCharRecursion (results: typeof charResponse[] = []){ 
  
  const rerunSearch = (x: typeof charResponse[]):TE.TaskEither<string, typeof charResponse[]> => {
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
  const cnIndex = arrayIsChineseIndex.slice(position.getPos(),position.getPos(true));
 
  return pipe(queryDB(searchArray,optionsArray,cnIndex),TE.orElse<string, typeof charResponse[],never>((error)=>TE.of([])),TE.chain<string,typeof charResponse[], typeof charResponse[]>(rerunSearch),TEconcat(TE.of(results)));
  })()
};
@Resolver()
export class CharacterResolver {
  @Query(returns => [charResponse])
    async findChar(@Arg('char', type => [String])char:string[],@Arg('options', type => Options )options:Options):Promise< typeof charResponse[]> {
  
    const trimCharArray = char.filter(v=>v!='').map(v=>v.toLowerCase());
    if(trimCharArray.length === 0) return [];
 
    const charResults: typeof charResponse[] = []; 
    const searchResults = await searchDB(trimCharArray,options)();
    pipe(searchResults,E.map((v)=>charResults.push(...v)));

    
    return charResults;

  }
}

