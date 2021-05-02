
//
//notes-main.js - Module for main ObscureNotes frontend logic.
//

//Application library functions
import { MemoApi } from './memo-api.js';
import { MemoConvert } from './memo-convert.js';
import { MemoCrypto } from './memo-crypto.js';

import { MemoContainer } from './memo-container.js';

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
        let keyHash = await MemoCrypto.hashKey(key);
        let salt = await MemoApi.getSalt(keyHash);
        let encryptedKey = await MemoCrypto.encryptKey(key, salt);

        let [encryptedNote, iv] = await MemoCrypto.encryptNote(key,salt,memotext);

        if(!update){
            let res = await MemoApi.createMemo(encryptedKey, encryptedNote, iv);
            console.log(res);

            //TODO: fix bug, check if "first" here
            insertMemo(res._id, memotext, true);
            document.getElementById('new-memo-input').value = "";
        }else{
            let res = await MemoApi.updateMemo(encryptedKey, memoid, encryptedNote, iv);
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

async function runMemoDelete(event){
    //id in form 'memo-update-btn-#####'
    let elemid = event.target.id;
    let id_index = elemid.lastIndexOf('-') + 1;
    let memoid = elemid.substring(id_index, elemid.length);

    let key = document.getElementById('key-input').value;

    let keyHash = await MemoCrypto.hashKey(key);
    let salt = await MemoApi.getSalt(keyHash);
    let encryptedKey = await MemoCrypto.encryptKey(key, salt);

    let res = await MemoApi.deleteMemo(encryptedKey, memoid);

    //Delete node in DOM
    let container = document.getElementById(`notes-container-${memoid}`);
    container.remove();
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
    updButton.id = `memo-update-btn-${id}`;

    let delButton = currentContainer.getElementsByClassName('memo-delete-btn')[0];
    delButton.id = `memo-delete-btn-${id}`;

    if(!first){
        updButton.addEventListener('click',(event)=>runMemoEncrypt(event, true));
        delButton.addEventListener('click', (event) => runMemoDelete(event));
    }
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

    let keyHash = await MemoCrypto.hashKey(key);
    let salt = await MemoApi.getSalt(keyHash);
    let encryptedKey = await MemoCrypto.encryptKey(key, salt);

    let notes = await MemoApi.getMemos(encryptedKey);
    console.log(notes);

    clearMemos();

    let first = true;
    for(let i=0; i<notes.length; i++){
        let note = notes[i];
        let decryptedNoteText = 
            await MemoCrypto.decryptNote(key, salt, note.iv, note.memobytes);
        
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

    let memoDeleteButton = document.getElementsByClassName('memo-delete-btn')[0];
    memoDeleteButton.addEventListener('click', (event) => runMemoDelete(event));

    //Provide access to my module functions
    //if we're debugging
    if(NOTES_DEBUG){
        window.MemoApi = MemoApi;
        window.MemoConvert = MemoConvert;
        window.MemoCrypto = MemoCrypto;
        window.bcrypt = dcodeIO.bcrypt;
        window.clearMemos = clearMemos;
    }
    console.log("Initialized");
}


window.onload = init;
