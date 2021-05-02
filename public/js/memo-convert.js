
//
//notes-convert.js - Module for helper functions that
//                   convert between hex string, bytes, and utf8 strings.
//

export class MemoConvert{
    //Convert ArrayBuffer bytes to a hex string.
    //ie arraybuffer [255, 255] => string 'ffff'
    static arrayBufferToHexString(data){
        //Convert bytes to a string
        let dataView = null;
        if(ArrayBuffer.isView(data))
            dataView = new DataView(data.buffer);
        else
            dataView = new DataView(data);

        let dataStr = '';

        for(let i=0;i<dataView.byteLength;i++){
            dataStr += dataView.getUint8(i).toString(16).padStart(2,'0');
        }

        return dataStr;
    }

    //Convert a hex string to a Uint8Array array buffer
    //ie string 'ffff' => arraybuffer [255, 255]
    static stringHexToArrayBuffer(str){
        let buffer = new ArrayBuffer(Math.ceil(str.length/2));
        let bufferView = new Uint8Array(buffer);

        for(let i=0;i<str.length;i+=2){
            let bufferIndex = Math.floor(i/2);
            let hexByte = '';
            if(i+2>str.length)
                hexByte=str.substring(i, i+1);
            else
                hexByte=str.substring(i, i+2);

            bufferView[bufferIndex] = parseInt(hexByte, 16);
        }

        return bufferView;
    }

    //Encode a string to utf8 bytes as an ArrayBuffer.
    //ie string 'ab' => arraybuffer [97, 98].
    //Optionally will pad or truncate the arraybuffer to
    //bytelength bytes. Input string is repeated to
    //pad the buffer.
    //Returns a Uint8Array
    static stringToArrayBuffer(str, bytelength=0){
        let encoder = new TextEncoder('utf-8');
        let res = encoder.encode(str); //Uint8Array

        if(bytelength == 0){
            return res;
        }else{
            //Pad by repeating, or truncate to length
            let buffer = new ArrayBuffer(bytelength);
            let bufferView = new Uint8Array(buffer);

            let strIndex = 0, bufferIndex = 0;
            while(bufferIndex<bytelength){
                bufferView[bufferIndex++] = res[strIndex++];

                //Loop initial str bytes, if bytelength is longer than the str
                if(strIndex>=res.length)
                    strIndex=0;
            }

            return bufferView;
        }
    }

    //Convert a hex string to a decoded utf8 string.
    //ie string '9798' => string 'ab'
    static stringHexToString(str){
        let data = stringHexToArrayBuffer(str);
        let decoder = new TextDecoder('utf-8');
        return decoder.decode(data);
    }

    //Convert an ArrayBuffer to a utf8 string.
    //ie arraybuffer [97,98] => string 'ab'
    static arrayBufferToString(data){
        let decoder = new TextDecoder('utf-8');
        return decoder.decode(data);
    }
}