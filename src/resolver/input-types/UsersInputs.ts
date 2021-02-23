import {InputType, Field} from 'type-graphql';
import {MaxLength,Length,IsEmail,IsNotEmpty,ValidationArguments} from 'class-validator';
import {Users} from '../../entities/Users'

const passLength = (args:ValidationArguments) => args.value.length < 8 ? 'Password is too short. A minimum of 8 is required' :
'Password is too long. A maximum of 20 is allowed';

@InputType()
export class RegInputs implements Partial<Users>{
@Field()
@MaxLength(15,{message:'Only a maximum of 15 characters is allowed for your username'})
@IsNotEmpty({message:'Username is required'})
username!: string;
@Field()
@Length(8, 20,({message:passLength}))
@IsNotEmpty({message:'Password is required'})
password!: string;
@Field()
@Length(8, 20,({message:passLength}))
@IsEmail({},{message:'Email is not valid'})
@IsNotEmpty({message:'Email is required'})
email!: string;
}


@InputType()
export abstract class LoginInputs implements Partial<RegInputs>{
@Field()
@IsNotEmpty({message:'Username is required'})
username!: string;
@Field()
@IsNotEmpty({message:'Password is required'})
password!: string;
} 

@InputType()
export class EmailInput implements Partial<RegInputs>{
@Field()
@IsEmail({},{message:'Email is not valid'})
@IsNotEmpty({message:'Email is required'})
email!: string;
}

@InputType()
export abstract class PasswordInput implements Partial<RegInputs>{
@Field()
@Length(8, 20,({message:passLength}))
@IsNotEmpty({message:'Password is required'})
password!: string;
} 