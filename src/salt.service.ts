import { Injectable } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { Salt } from './salt.model';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class SaltService {

    constructor(private readonly mongoService: MongoService){}

    /*
    Create a new salt using bcryptjs
    */
    createNewSalt(): string{
        let salt = bcrypt.genSaltSync(10);

        return salt;
    }

    /*
    Based on a key hash, get the existing salt or
    create a new one for that hash.
    */
    async getOrCreateSalt(keyHash: string): Promise<string>{
        let client = this.mongoService.getClient();
        let collection = client.db('test').collection('salts');

        let findErr, saltRecord: Salt = await collection.findOne({keyHash: keyHash});
        if(findErr){
            console.error(findErr);
            console.log('Unexpected error while trying to read salt');
            throw findErr;
        }

        //Salt already exists, return it
        if(saltRecord){
            console.log(`Salt ${saltRecord.salt} found for keyhash ${keyHash}`);
            return Promise.resolve(saltRecord.salt);
        }

        //Create and persist a new salt
        let newSalt = this.createNewSalt();
        let insertErr, res = await collection.insertOne(<Salt>{
            keyHash: keyHash,
            salt: newSalt
        });

        if(insertErr){
            console.error(insertErr);
            console.log('Unexpected error while trying to insert salt');
            throw insertErr;
        }

        console.log(`Created and mapped salt ${newSalt} to keyhash ${keyHash}`);
        return newSalt;
    }

    async deleteSalt(keyHash: string): Promise<void>{
        let client = this.mongoService.getClient();
        let collection = client.db('test').collection('salts');

        let err, res = collection.deleteOne({keyHash: keyHash});
        if(err){
            console.error(err);
            console.error(`Failed to delete salt for keyhash ${keyHash}`);
            throw err;
        }

        console.error(`Deleted salt for keyhash ${keyHash}`);
        return Promise.resolve();
    }
}
