import { Controller, Get, Query, Render, Redirect, Body, Post } from '@nestjs/common';

/*
App landing page.
*/
@Controller()
export class AppController {
    constructor() { }

    @Get('/')
    @Render('index')
    index() {
        return {};
    }
}
