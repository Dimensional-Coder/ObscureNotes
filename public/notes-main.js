
//
//notes-main.js - Module for main ObscureNotes frontend logic.
//

//Application library functions
import { NotesApi } from './notes-api.js';
import { NotesConvert } from './notes-convert.js';
import { NotesCrypto } from './notes-crypto.js';

import { NotesContainer } from './notes-container.js';

const NOTES_DEBUG = true;

async function runMemoEncrypt(event, update=false){
    console.log(event);

    let key = document.getElementById('key-input').value;
    let memotext = null;
    let memoid = null;
    
    if(!update){
        memotext = document.getElementById('new-memo-input').value;
    }else{
        //id in form 'memo-update-btn-#####'
        let elemid = event.target.id;
        let id_index = elemid.lastIndexOf('-') + 1;
        memoid = elemid.substring(id_index, elemid.length);
        memotext = document.getElementById(`memo-input-${memoid}`).value;
    }

    try{
        let keyHash = await NotesCrypto.hashKey(key);
        let salt = await NotesApi.getSalt(keyHash);
        let encryptedKey = await NotesCrypto.encryptKey(key, salt);
        encryptedKey = encryptedKey.replaceAll("/","_");

        let [encryptedNote, iv] = await NotesCrypto.encryptNote(key,salt,memotext);

        if(!update){
            let res = await NotesApi.createMemo(encryptedKey, encryptedNote, iv);
            console.log(res);

            insertMemo(res._id, memotext);
            document.getElementById('new-memo-input').value = "";
        }else{
            let res = await NotesApi.updateMemo(encryptedKey, memoid, encryptedNote, iv);
            console.log(res);
        }

        if(NOTES_DEBUG){
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
    }
    catch(err){
        console.error(err);
    }
}

//Create a new DOM element for a memo object
function insertMemo(id, memotext, first=false){
    let elems = document.getElementsByClassName('notes-container');
    let lastContainer = elems[elems.length-1];
            
    let currentContainer = null;
    if(first){
        currentContainer = lastContainer;
    }
    else{
        currentContainer = lastContainer.cloneNode(true);
        lastContainer.insertAdjacentElement("afterend", currentContainer);
    }

    //Write the memo into this element
    let input = currentContainer.getElementsByClassName('memo-input')[0];
    input.value = memotext;
    currentContainer.id = `notes-container-${id}`;
    input.id = `memo-input-${id}`;
    input.name = `memo-input-${id}`;

    let updButton = currentContainer.getElementsByClassName('memo-update-btn')[0];
    updButton.id= `memo-update-btn-${id}`;

    if(!first)
        updButton.addEventListener('click',(event)=>runMemoEncrypt(event, true));
}

//Remove DOM elements for existing memos, excluding the first
function clearMemos(){
    let memoElements = document.getElementsByClassName('notes-container');

    //Reset list by deleting all but first note dom element
    for(let i=memoElements.length-1; i>=1; i--){
        memoElements[i].remove();
    }

    memoElements[0].getElementsByClassName('memo-input')[0].value="";
}

async function populateMemos(){
    let key = document.getElementById('key-input').value;

    let keyHash = await NotesCrypto.hashKey(key);
    let salt = await NotesApi.getSalt(keyHash);
    let encryptedKey = await NotesCrypto.encryptKey(key, salt);
    encryptedKey = encryptedKey.replaceAll("/","_");

    let notes = await NotesApi.getMemos(encryptedKey);
    console.log(notes);

    clearMemos();

    let first = true;
    for(let i=0; i<notes.length; i++){
        let note = notes[i];
        let decryptedNoteText = 
            await NotesCrypto.decryptNote(key, salt, note.iv, note.memobytes);
        
        insertMemo(note._id, decryptedNoteText, first);
        first=false;
    }
}

function init(){
    
    let keySubmitButton = document.getElementById('memo-submit-btn');
    keySubmitButton.addEventListener('click', (event) => runMemoEncrypt(event));

    let getNotesButton = document.getElementById('key-submit-btn');
    getNotesButton.addEventListener('click', () => populateMemos());

    let memoUpdateButton = document.getElementsByClassName('memo-update-btn')[0];
    memoUpdateButton.addEventListener('click', (event) => runMemoEncrypt(event, true));

    //Provide access to my module functions
    //if we're debugging
    if(NOTES_DEBUG){
        window.NotesApi = NotesApi;
        window.NotesConvert = NotesConvert;
        window.NotesCrypto = NotesCrypto;
        window.bcrypt = dcodeIO.bcrypt;
        window.clearMemos = clearMemos;
    }
    console.log("Initialized");
}


window.onload = init;
