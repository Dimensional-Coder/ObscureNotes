
//
//notes-crypto.js - Module for performing cryptography
//                  functions for ObscureNotes.
//

import { MemoConvert } from './notes-convert.js';

//bcrypt.js library must be included in a script tag
var bcrypt = window.dcodeIO.bcrypt;


//How short the hashed key will be truncated to
const HASH_LENGTH = 5;

//WebCrypto key permissions
const AES_KEY_USAGES = ["encrypt", "decrypt"];
const PBK_KEY_USAGES = ["deriveBits", "deriveKey"];

//PBKDF2 parameters
const NUM_KEY_ITERATIONS = 10;

//AES parameters
const AES_ALGORITHM = 'AES-GCM';
const AES_BIT_LENGTH = 256;
const AES_BYTE_LENGTH = AES_BIT_LENGTH/8;

//For generating aes key
const SALT_BYTE_LENGTH = 16;

export class MemoCrypto{
    
    /*
    Generate an aes key from a raw string key (password).
    Uses pbkdf2 to generate the key, with the SHA-512 hash.
    */
    static async genAesKey(plaintextKey, salt){

        let saltData = MemoConvert.stringToArrayBuffer(salt, SALT_BYTE_LENGTH);
        let pbkdf2Params = {
            name: 'PBKDF2',
            hash: 'SHA-512',
            salt: saltData,
            iterations: NUM_KEY_ITERATIONS
        };

        let aesParams = {
            name: AES_ALGORITHM,
            length: AES_BIT_LENGTH
        };

        //Turn text key into a cryptoKey as input
        let keyData = MemoConvert.stringToArrayBuffer(plaintextKey, AES_BYTE_LENGTH);
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

    /**
     * Encrypt a text note (symmetric) with aes using a plaintext key and salt.
     * @param {*} key Plaintext keyphrase, used to generate aes key
     * @param {*} salt Salt for key
     * @param {*} note Plaintext note to encrypt
     * @returns Tuple:
     *              - Encrypted note as a hex string
     *              - Initialization vector as a hex string
     */
    static async encryptNote(key, salt, note){
        let noteData = MemoConvert.stringToArrayBuffer(note);

        let cryptoKey = await MemoCrypto.genAesKey(key, salt);

        //Initialization vector for AES
        let iv = window.crypto.getRandomValues(new Uint8Array(12));

        let encryptedData = await window.crypto.subtle.encrypt({
            name: "AES-GCM",
            iv: iv
        }, cryptoKey, noteData);

        let encryptedNote = MemoConvert.arrayBufferToHexString(encryptedData);
        let ivhexstring = MemoConvert.arrayBufferToHexString(iv);

        return Promise.resolve([encryptedNote, ivhexstring]);
    }

    /**
     * Decrypts a text note with aes using a plaintext key.
     * @param {*} key Plaintext keyphrase
     * @param {*} salt Salt for key
     * @param {*} ivHexString Initialization vector hexstring used to
     *                        encrypt this note.
     * @param {*} noteHexString The encrypted note as a hex string
     * @returns The decrypted note as a utf8 string
     */
    static async decryptNote(key, salt, ivHexString, noteHexString){
        let noteData = MemoConvert.stringHexToArrayBuffer(noteHexString);
        let iv = MemoConvert.stringHexToArrayBuffer(ivHexString);

        let cryptoKey = await MemoCrypto.genAesKey(key, salt);

        let decryptedData = await window.crypto.subtle.decrypt({
            name: "AES-GCM",
            iv: iv
        }, cryptoKey, noteData);

        let decryptedNote = MemoConvert.arrayBufferToString(decryptedData);

        return Promise.resolve(decryptedNote);
    }

    /**
     * Encrypt plaintext key (asymmetric) using bcrypt.
     * @param {*} key Plaintext keyphrase
     * @param {*} salt Salt for key
     * @returns The encrypted key as a string (bcrypt format)
     */
    static async encryptKey(key, salt){
        let encrypted = await bcrypt.hash(key, salt);

        return Promise.resolve(encrypted);
    }

    /**
     * Hash plaintext key using a weak algorithm. Hash is
     * truncated to make it impossible to reverse the hash
     * and discover the key phrase.
     * 
     * @param {*} key Plaintext keyphrase
     * @returns A truncated hash of the key as a hex string
     */
    static async hashKey(key){
        let data = MemoConvert.stringToArrayBuffer(key);

        let digestData = await crypto.subtle.digest('SHA-1', data);

        let digestStr = MemoConvert.arrayBufferToHexString(digestData);

        let trimmed = digestStr.substring(0, HASH_LENGTH);

        return Promise.resolve(trimmed);
    }
}