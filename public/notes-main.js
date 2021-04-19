
const HASH_LENGTH = 5;
const NUM_KEY_ITERATIONS = 10;
const AES_KEY_USAGES = ["encrypt", "decrypt"];
const PBK_KEY_USAGES = ["deriveBits", "deriveKey"];
const AES_ALGORITHM = 'AES-GCM';
const AES_BIT_LENGTH = 256;
const AES_BYTE_LENGTH = AES_BIT_LENGTH/8;

//For generating aes key
const SALT_BYTE_LENGTH = 16;

//Convert ArrayBuffer bytes to a hex string.
//ie arraybuffer [255, 255] => string 'ffff'
function arrayBufferToHexString(data){
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
function stringHexToArrayBuffer(str){
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
function stringToArrayBuffer(str, bytelength=0){
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
function stringHexToString(str){
    let data = stringHexToArrayBuffer(str);
    let decoder = new TextDecoder('utf-8');
    return decoder.decode(data);
}

//Convert an ArrayBuffer to a utf8 string.
//ie arraybuffer [97,98] => string 'ab'
function arrayBufferToString(data){
    let decoder = new TextDecoder('utf-8');
    return decoder.decode(data);
}

/*
Generate an aes key from a raw string key (password).
Uses pbkdf2 to generate the key, with the SHA-512 hash.
*/
async function genAesKey(plaintextKey, salt){

    let saltData = stringToArrayBuffer(salt, SALT_BYTE_LENGTH);
    pbkdf2Params = {
        name: 'PBKDF2',
        hash: 'SHA-512',
        salt: saltData,
        iterations: NUM_KEY_ITERATIONS
    };

    aesParams = {
        name: AES_ALGORITHM,
        length: AES_BIT_LENGTH
    };

    //Turn text key into a cryptoKey as input
    let keyData = stringToArrayBuffer(plaintextKey, AES_BYTE_LENGTH);
    let inputCryptoKey = await window.crypto.subtle.importKey(
        'raw', keyData, {
            name: "PBKDF2"
        }, false, PBK_KEY_USAGES
    );
    
    let generatedKey = await window.crypto.subtle.deriveKey(
        pbkdf2Params, inputCryptoKey, aesParams, false, AES_KEY_USAGES
    );

    return Promise.resolve(generatedKey);
}

var lastiv = null;
var lastenc = null;
async function encryptNote(key, salt, note){
    let noteData = stringToArrayBuffer(note);

    let cryptoKey = await genAesKey(key, salt);

    //Initialization vector for AES
    let iv = window.crypto.getRandomValues(new Uint8Array(12));

    let ivhexstring = arrayBufferToHexString(iv);
    console.log(`Initialization vector hexstring: ${ivhexstring}`);

    let encryptedData = await window.crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: iv
    }, cryptoKey, noteData);

    let encryptedNote = arrayBufferToHexString(encryptedData);
    console.log(`Encrypted data hexstring: ${encryptedNote}`);

    lastiv = ivhexstring;
    lastenc = encryptedNote;

    return encryptedNote;
}

async function decryptNote(key, salt, noteHexString, ivHexString){
    let noteData = stringHexToArrayBuffer(noteHexString);
    let iv = stringHexToArrayBuffer(ivHexString);

    let cryptoKey = await genAesKey(key, salt);

    let decryptedData = await window.crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: iv
    }, cryptoKey, noteData);

    let decryptedNote = arrayBufferToString(decryptedData);
    console.log(`Decrypted note: ${decryptedNote}`)

    return decryptedNote;
}

async function encryptKey(key, salt){
    let encrypted = await bcrypt.hash(key, salt);

    return Promise.resolve(encrypted);
}

async function getSalt(keyHash){
    let res = await fetch(`/salt/${keyHash}`, {
        method: 'GET'
    });
    
    let data = await res.json();
    console.log(data);

    return Promise.resolve(data.salt);
}

async function hashKey(key){
    let data = stringToArrayBuffer(key);

    let digestData = await crypto.subtle.digest('SHA-1', data);

    let digestStr = arrayBufferToHexString(digestData);

    let trimmed = digestStr.substring(0, HASH_LENGTH);
    //let trimmed = digestStr;

    return Promise.resolve(trimmed);
}

async function runEncrypt(){
    let key = document.getElementById('key-input').value;
    let newmemo = document.getElementById('new-memo-input').value;

    try{
        let keyHash = await hashKey(key);
        let salt = await getSalt(keyHash);
        let encrypted = await encryptKey(key, salt);

        //Display results on the page
        let hashResult = document.getElementById('hash-result');
        hashResult.innerHTML=keyHash;
        
        let saltResult = document.getElementById('salt-result');
        saltResult.innerHTML=salt;
        
        let encryptResult = document.getElementById('encrypt-result');
        encryptResult.innerHTML=encrypted;
    }
    catch(err){
        console.error(err);
    }
}

var bcrypt;

function init(){
    bcrypt = dcodeIO.bcrypt;

    keySubmitButton = document.getElementById('key-submit-btn');

    keySubmitButton.addEventListener('click', () => runEncrypt());

    console.log("Initialized")
}


window.onload = init;