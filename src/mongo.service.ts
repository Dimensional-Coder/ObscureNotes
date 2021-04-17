import { Injectable } from '@nestjs/common';
import {MongoClient} from 'mongodb';

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
}
