import {Column} from "typeorm";
import { ObjectType, Field, InterfaceType } from "type-graphql";
import {Characters} from './Characters';
import {Sentences} from './Sentences';
import {Words} from './Words';

@ObjectType()
export class Common {
@Field()
@Column()
character!: string;
@Field()
@Column()
pinyin!: string;
@Field()
@Column()
meaning!: string;
}

@InterfaceType({resolveType: value => {
  if ('chengyu' in value) {
    return 'Sentences'; 
  }

  if ('variant' in value) {
    return 'Characters';
  }

  if ('flashcardwords' in value) {
    return 'Words'; 
  }

return null;
}})
export abstract class CharCollection {
  @Field()
  id!:number;
  @Field(type => Common)
  char_detail!:Common;
}
