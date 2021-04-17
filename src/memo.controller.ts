import { Controller, Get, Query, Render, Redirect, Body, Post, Res, Delete, Param, Put } from '@nestjs/common';

import { MongoService } from './mongo.service';
import { Memo } from './memo.model';
import { identity } from 'rxjs';
import { ObjectID } from 'bson';

/*
Basic CRUD operations for notes/memos.
*/
@Controller()
export class MemoController {

    constructor(
        private readonly mongoService: MongoService
    ) { }

    /**
    
    */
    @Get('/memos/:encryptedKey')
    async getMemos(@Param('encryptedKey') encryptedKey: string) {
        let collection = this.mongoService.getMemoCollection(encryptedKey);

        let err, memos = await collection.find().toArray();

        if(err){
            console.error(err);
            console.error(`Failed to retrieve memos for encrypted key ${encryptedKey}`)
            throw err;
        }

        return Promise.resolve({
            memos: memos
        });
    }

    @Post('/memos/:encryptedKey')
    async createMemo(@Param('encryptedKey') encryptedKey, @Body('text') text){
        let collection = this.mongoService.getMemoCollection(encryptedKey);

        let newMemo: Memo = {text: text};
        let err, res = await collection.insertOne(newMemo);

        if(err){
            console.error(err);
            console.error(`Failed to insert new memo for encrypted key ${encryptedKey}`)
            throw err;
        }

        return Promise.resolve(res.ops[0]);
    }

    @Put('/memos/:encryptedKey/:id')
    async updateMemo(@Param('encryptedKey') encryptedKey, @Param('id') id, @Body('text') text){
        let collection = this.mongoService.getMemoCollection(encryptedKey);

        let err, res = await collection.updateOne(
            {_id: new ObjectID(id)},
            { $set: {text: text}}
        );

        if(err){
            console.error(err);
            console.error(`Failed to update memo ${id} for encrypted key ${encryptedKey}`)
            throw err;
        }

        return Promise.resolve({success: true});
    }
}
