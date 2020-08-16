import { Controller, Get, Query, Render, Redirect, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';

import {twofish} from 'twofish';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Render('index')
  index(@Query('val') val) {
    let crypt = twofish(),
      ckey = crypt.stringToByteArray('dickdickdickdick');
    
    let v = 'aaaa';
    let barr = crypt.stringToByteArray(v);

    let encrypted = crypt.encrypt(ckey, barr);
    let encryptedText = crypt.byteArrayToString(encrypted);

    let encryptedTextBytes = crypt.stringToByteArray(encryptedText);
    let decrypted = crypt.decrypt(ckey, encryptedTextBytes);
    let decryptedText = crypt.byteArrayToString(decrypted);
    let decryptedTextBytes = crypt.stringToByteArray(decryptedText);

    console.log(`Value: ${v}`)
    console.log(`Encrypted: ${encrypted}, \n\tText: ${encryptedText}, \n\tTextBytes: ${encryptedTextBytes}`)
    console.log(`Decrypted: ${decrypted}, \n\tText: ${decryptedText}, \n\tTextBytes: ${decryptedTextBytes}`)
    
    

    return {str: val}
  }

  @Post('/')
  @Redirect('')
  indexPost(@Body('val') val, @Body('encrypt') encrypt, @Body('key') key){

    let crypt = twofish(),
      ckey = crypt.stringToByteArray(key),
      cval = crypt.stringToByteArray(val);

    let result;
    if(encrypt === 'encrypt'){
      console.log('Encrypting')
      result = crypt.encrypt(ckey, cval);
      let resultText = crypt.byteArrayToString(result);
      console.log(resultText);

      let decrypted = crypt.decrypt(ckey, crypt.stringToByteArray(resultText));
      console.log(crypt.byteArrayToString(decrypted))
    }else{
      console.log('Decrypting')
      result = crypt.decrypt(ckey, cval);
    }

    result = crypt.byteArrayToString(result);

    return {
      url: `?val=${result}`
    }
  }
}
