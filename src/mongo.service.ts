import { Injectable } from '@nestjs/common';
import {Collection, MongoClient} from 'mongodb';
import { Memo } from './memo.model';
import { Salt } from './salt.model';

@Injectable()
export class MongoService {

    mongoClient: MongoClient;

    constructor(){
        let uri: string = 'mongodb://localhost:27017';
        this.mongoClient = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /*
    Return a promise that attempts to initialize a connection to the database.
    Promise is resolved to true if successful, rejected if unsuccessful.
    */
    async init(): Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            this.mongoClient.connect().then(
                //Success
                (client) => {
                    console.log('Successful connection opened to mongo database.')
                    this.mongoClient = client;
                    resolve(true);
                },
                //Error
                (err) => {
                    console.error(err);
                    console.error('Failed to open connection to mongo database.');
                    reject(false);
                }
            )
        });
    }

    getClient(): MongoClient{
        return this.mongoClient;
    }

    getSaltCollection(): Collection<Salt>{
        return this.mongoClient.db('test').collection('salts');
    }

    getMemoCollection(encryptedKey: string): Collection<Memo>{
        //Remove information and salt from beginning of key, last 31 characters
        //are the actual hash
        //https://en.wikipedia.org/wiki/Bcrypt#Description
        encryptedKey = encryptedKey.substring(encryptedKey.length-31);
        
        let collectionName = 'memos'+encryptedKey;
        return this.mongoClient.db('test').collection(collectionName);
    }
}
