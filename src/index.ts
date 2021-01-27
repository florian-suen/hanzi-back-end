import "reflect-metadata";
import express from 'express';
import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import {createConnection, Connection, getRepository, getConnection, Like} from "typeorm";
import 'dotenv/config';
import {Characters} from './entities/Characters';
import {CharacterResolver} from './resolver/Character'
import {Sentences} from './entities/Sentences';
import {Users} from './entities/Users';
import {Words} from './entities/Words';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe,flow } from 'fp-ts/lib/function';
import * as C from 'fp-ts/lib/Console';
import * as IO from 'fp-ts/lib/IO';
import * as O from 'fp-ts/lib/Option';




const dbConnect = (url = process.env.DBURL):TE.TaskEither<string, Connection> => {
  const Connection = TE.tryCatch(()=> createConnection({
    type: 'postgres',
    url:url,
    synchronize:true,
    logging:true,
    entities:[Characters,Sentences,Users,Words]
  }),(reason)=> typeof reason === 'object' ? `Connection established but error: ${((reason as Error).stack)}` :'Critical error: Connection never established')
   
  return Connection;
  }
  
const logDBSuccess = TE.chainFirst<string,Connection,void>(()=>TE.of(C.log('Database Connection Success')()));
const logDBError = TE.mapLeft<string,O.Option<string>>((error)=>pipe(O.of(error),O.chainFirst((error)=>O.of(C.log(error)()))));
const logDBConnection = flow(logDBSuccess,logDBError)

pipe(dbConnect(),logDBConnection)();  

const app = IO.of(express);
const appGet = (app:express.Application )=>IO.of(app.get('/',(req,res)=>{ res.send('You have received a message')}));
const appListen = (app:express.Application)=>IO.of(app.listen(parseInt(process.env.PORT!),()=>{
C.log("server on localhost:4000")();
}));

const connectApollo = async (app:express.Application) => {
      const schema = await buildSchema({
      resolvers: [CharacterResolver],
      validate: false, });
    
      const apolloServer = new ApolloServer({introspection: true,playground:true,
          schema: schema
      });
      apolloServer.applyMiddleware({app,cors:false});
    }

pipe(app()(),IO.of,IO.chainFirst(appGet),TE.fromIO,TE.chainFirst(flow(connectApollo,TE.of)),TE.map(appListen))();





