import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { MemoController } from './memo.controller';
import { MongoService } from './mongo.service';
import { SaltController } from './salt.controller';
import { SaltService } from './salt.service';

@Module({
    imports: [],
    controllers: [AppController, SaltController, MemoController],
    providers: [MongoService, SaltService],
})
export class AppModule implements OnModuleInit{

    constructor(private readonly mongoService: MongoService){}

    async onModuleInit(): Promise<any>{
        //Cause an error on reject if connection fails
        return this.mongoService.init();
    }
}
