import {InputType, Field} from 'type-graphql';
import {MaxLength,Length,IsEmail,IsNotEmpty,ValidationArguments, Matches} from 'class-validator';
import {Users} from '../../entities/Users'

const passLength = (args:ValidationArguments) => args.value.length < 8 ? 'Password is too short. A minimum of 8 is required' :
'Password is too long. A maximum of 18 is allowed';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[- +?!@#$%^&*\/\\])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9- +?!@#$%^&*\/\\]+$/;

@InputType()
export class RegInputs implements Partial<Users>{
@Field()
@IsNotEmpty({message:'Username is required'})
@MaxLength(20,{message:'Only a maximum of 20 characters is allowed for your username'})
username!: string;
@Field()
@IsNotEmpty({message:'Password is required'})
@Length(8, 18,({message:passLength}))
@Matches(PASSWORD_REGEX,{message:'A special character (-+?!@#$%^&*), number, and at least one upper and lower case character is required'})
password!: string;
@Field()
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
@Length(8, 18,({message:passLength}))
@IsNotEmpty({message:'Password is required'})
password!: string;
} 