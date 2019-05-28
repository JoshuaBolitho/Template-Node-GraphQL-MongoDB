import { makeExecutableSchema } from 'graphql-tools';
import { MongoClient, ObjectId } from 'mongodb';


class DataLayer {


  constructor() { }


  async connect (url) {

    // start mongodb
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    let db = await client.db('rocketDemo');
    this.userCollection = db.collection('user');
    // userCollection.drop();
  }


  async getSchema () {

    // graphql definitions
    const typeDefs = `
      type Query {
        user(_id:String!, name:String):User
        users:[User]
      },
      type User {
        _id:String
        name:String
        favorites:[Favorite]
      },
      type Favorite {
        favoriteID:String
      },
      type Mutation {
        addUser(name:String!):User
        addFavorite(_id:String, favoriteID:String):User
        removeFavorite(_id:String, favoriteID:String):User
      }
    `;

    const prepare = (o) => {
      o._id = o._id.toString();
      return o;
    };

    // graphql resolvers
    const resolvers = {
      Query: {
        user: async (root, args) => {
          return await this.userCollection.findOne(ObjectId(args._id));
        },
        users: async (root) => {
          return (await this.userCollection.find({}).toArray()).map(prepare);
        }
      },
      Mutation: {
        addUser: async (root, args) => {
          const res = await this.userCollection.insertOne({name:args.name, favorites:[]});
          return await this.userCollection.findOne({_id:res.insertedId});
        },
        addFavorite: async (root, args) => {
          const res = await this.userCollection.updateOne({_id:ObjectId(args._id)}, { "$addToSet":{ favorites: {favoriteID:args.favoriteID}} });
          return await this.userCollection.findOne(ObjectId(args._id));
        },
        removeFavorite: async (root, args) => {
          const res = await this.userCollection.updateOne({_id:ObjectId(args._id)}, { "$pull":{ favorites: {favoriteID:args.favoriteID}} });
          return await this.userCollection.findOne(ObjectId(args._id));
        }
      }
    };

    return await makeExecutableSchema({
      typeDefs:typeDefs,
      resolvers:resolvers
    });
  }

}

export default new DataLayer();
