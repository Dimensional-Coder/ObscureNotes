
//
//notes-main.js - Module for main ObscureNotes frontend logic.
//

import { NotesApi } from './notes-api.js';
import { NotesConvert } from './notes-convert.js';
import { NotesCrypto } from './notes-crypto.js';

const NOTES_DEBUG = true;

async function runEncrypt(){
    let key = document.getElementById('key-input').value;
    let newmemo = document.getElementById('new-memo-input').value;

    try{
        let keyHash = await NotesCrypto.hashKey(key);
        let salt = await NotesApi.getSalt(keyHash);
        let encryptedKey = await NotesCrypto.encryptKey(key, salt);

        let [encryptedNote, iv] = await NotesCrypto.encryptNote(key,salt,newmemo);

        let res = await NotesApi.createMemo(encryptedKey, encryptedNote, iv);
        //Display results on the page
        let hashResult = document.getElementById('hash-result');
        hashResult.innerHTML=keyHash;
        
        let saltResult = document.getElementById('salt-result');
        saltResult.innerHTML=salt;
        
        let encryptKeyResult = document.getElementById('encrypt-key-result');
        encryptKeyResult.innerHTML=encryptedKey;

        let ivResult = document.getElementById('iv-result');
        ivResult.innerHTML=iv;

        let encryptNoteResult = document.getElementById('encrypt-note-result');
        encryptNoteResult.innerHTML=encryptedNote;
    }
    catch(err){
        console.error(err);
    }
}

function init(){
    
    let keySubmitButton = document.getElementById('key-submit-btn');

    keySubmitButton.addEventListener('click', () => runEncrypt());

    //Provide access to my module functions
    //if we're debugging
    if(NOTES_DEBUG){
        window.NotesApi = NotesApi;
        window.NotesConvert = NotesConvert;
        window.NotesCrypto = NotesCrypto;
        window.bcrypt = dcodeIO.bcrypt;
    }
    console.log("Initialized");
}


window.onload = init;
