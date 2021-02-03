import { Semigroup } from 'fp-ts/Semigroup';
import {getSemigroup, TaskEither}from 'fp-ts/lib/TaskEither';
import {CharCollection} from '../entities/Common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
interface TEconcat {
    (x:TaskEither<unknown,CharCollection[]>):(y:TaskEither<unknown,CharCollection[]>) 
    => TaskEither<unknown,CharCollection[]>
   }

    const arraySemigroup:Semigroup<Array<CharCollection>> = {concat: (x, y) => x.concat(y)};
    const semiGroupCharColl = getSemigroup(arraySemigroup);
    const duplicateCheck = (chars:CharCollection[])=> chars.filter((val,index,arr)=>arr.findIndex(v=>(v.id === val.id && v.char_detail.character === val.char_detail.character ))=== index);
    const concatTEChar:TEconcat = (x)=>(y)=>pipe(semiGroupCharColl.concat(x,y),TE.map(duplicateCheck));
    
    export default concatTEChar;