import {validate,ValidationError} from 'class-validator';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import {ValidationErrors} from '../resolver/object-types/UsersObject'

interface Validator extends ValidationErrors {}

export function validator(inputs:object):Promise<Validator>{
const validationError:T.Task<ValidationError[]> = () => validate(inputs); 
const validationMapResponse = (val:ValidationError[])=>val && val.map((v)=>({property:v.property,constraints:v.constraints!})) 
const validationResults = pipe(validationError,T.map(validationMapResponse),T.map((val)=>({message:'There was a problem with your details. Please re-check the marked fields', responses:val})))()
return validationResults;
}

