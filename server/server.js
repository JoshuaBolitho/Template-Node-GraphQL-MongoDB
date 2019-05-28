import express from 'express';
import cors from 'cors';
import { buildSchema } from 'graphql';
import graphqlHTTP from 'express-graphql';
import DataLayer from './src/data-layer';

const MONGO_URL = 'mongodb://localhost:27017/';


class Server {

  constructor () {}

  async start () {

    await DataLayer.connect(MONGO_URL);
    let schema = await DataLayer.getSchema();

    // express initialization
    var app = express();
    app.use(cors());
    app.use('/graphql', graphqlHTTP({ graphiql:true, schema:schema }));
    app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
  }
}

export default new Server();
