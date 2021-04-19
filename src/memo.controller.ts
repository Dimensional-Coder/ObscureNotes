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

    /**
     * Create or update a memo.
     * @param encryptedKey Encrypted key to identify the memo collection
     * @param memoid Id of the memo, if this is an update
     * @param memobytes Encrypted memo text as a hex string (ie, 'ff10')
     * @param iv Initialization vector used to encrypt the memo
     * @returns Object
     *              - operation: Operation done, 'create' or 'update'
     *              - success: true or false
     *              - memoobject: The memo object created or updated
     */
    @Post('/memos/:encryptedKey/:memoid?')
    async upsertMemo(
        @Param('encryptedKey') encryptedKey, @Param('memoid') memoid,
        @Body('memobytes') memobytes, @Body('iv') iv){

        let collection = this.mongoService.getMemoCollection(encryptedKey);

        let memo: Memo = {
            memobytes: memobytes,
            iv: iv
        };

        //This is a new memo
        if(!memoid){
            let err, res = await collection.insertOne(memo);

            if(err){
                console.error(err);
                console.error(`Failed to insert new memo for encrypted key ${encryptedKey}`)
                throw err;
            }

            let newmemo = res.ops[0];
            console.log(`Created memo ${newmemo._id} for key ${encryptedKey}`);
    
            return Promise.resolve({
                operation: 'create',
                success: true,
                memoobject: newmemo
            });
        }
        
        //If id provided, update instead of create
        else{
            let id = new ObjectID(memoid)

            let err, res = await collection.updateOne(
                {_id: id},
                { $set: {memobytes: memobytes, iv: iv}}
            );
    
            if(err){
                console.error(err);
                console.error(`Failed to update memo ${id} for encrypted key ${encryptedKey}`)
                throw err;
            }
    
            console.log(`Updated memo ${memoid} for key ${encryptedKey}`);
            return Promise.resolve({
                operation: 'update',
                success: true,
                memoobject: {
                    _id: memoid,
                    memobytes: memobytes,
                    iv: iv
                }
            });
        }
    }
}
