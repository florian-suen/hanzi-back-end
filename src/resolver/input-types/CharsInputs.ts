
import {InputType, Field} from 'type-graphql';
@InputType()
export class Options {
@Field()
characters!: boolean;
@Field()
words!: boolean;
@Field()
sentences!: boolean;
} 


