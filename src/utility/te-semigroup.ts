import { Semigroup } from 'fp-ts/Semigroup';
import {getSemigroup, TaskEither}from 'fp-ts/lib/TaskEither';
import {charResponse} from '../resolver/CharactersResolver';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
interface TEconcat {
    (x:TaskEither<string,typeof charResponse[]>):(y:TaskEither<string,typeof charResponse[]>) 
    => TaskEither<string,typeof charResponse[]>
   }

    const arraySemigroup:Semigroup<Array<typeof charResponse>> = {concat: (x, y) => x.concat(y)};
    const semiGroupCharColl = getSemigroup<string, typeof charResponse[]>(arraySemigroup);
    const duplicateCheck = (chars:typeof charResponse[])=> chars.filter((val,index,arr)=>arr.findIndex(v=>(v.char_detail.character === val.char_detail.character )) === index);
    const concatTEChar:TEconcat = (x)=>(y)=>pipe(semiGroupCharColl.concat(x,y),TE.map(duplicateCheck));
    
    export default concatTEChar;