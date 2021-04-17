import { Controller, Get, Query, Render, Redirect, Body, Post, Res, Delete, Param } from '@nestjs/common';

import { MongoService } from './mongo.service';
import { Salt } from './salt.model';
import { SaltService } from './salt.service';

//crypto

/*
Basic CRUD operations for salts.


*/
@Controller()
export class SaltController {

    constructor(
        private readonly saltService: SaltService,
        private readonly mongoService: MongoService
    ) { }

    /**
    API method to get a salt for a given key hash. Idempotent, but
    has side effect of creating a new salt for the hash if one
    doesn't exist already. The key hash is stored in the database.

    @param keyHash Hashed key used to identify the key. This will
                   be generated by the client and should be truncated
                   to prevent cracking the key.
    @return Json with 'salt' field.
    */
    @Get('/salt/:keyHash')
    async getSalt(@Param('keyHash') keyHash: string) {
        let salt = await this.saltService.getOrCreateSalt(keyHash);

        return Promise.resolve({
            salt: salt
        });
    }

    @Get('/salts')
    async getAllSalts(){
        let client = this.mongoService.getClient();
        let collection = client.db('test').collection('salts');

        let err, allSalts = await collection.find().toArray();

        return Promise.resolve({
            salts: allSalts
        });
    }

    @Delete('/salt')
    async deleteSalt(@Body() keyHash){
        //stub


    }
}
