import { Request, Response, } from 'express';
import { Redis } from 'ioredis';
import { Session, SessionData} from 'express-session'

export default interface myContext {
req:Request  & {session: Session & Partial<SessionData> & {userId?:number}};
res:Response;
reddis:Redis;
}