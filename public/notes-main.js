
//
//notes-main.js - Module for main ObscureNotes frontend logic.
//

//Application library functions
import { NotesApi } from './notes-api.js';
import { NotesConvert } from './notes-convert.js';
import { NotesCrypto } from './notes-crypto.js';

import { NotesContainer } from './notes-container.js';

const NOTES_DEBUG = true;

async function runEncrypt(){
    let key = document.getElementById('key-input').value;
    let newmemo = document.getElementById('new-memo-input').value;

    try{
        let keyHash = await NotesCrypto.hashKey(key);
        let salt = await NotesApi.getSalt(keyHash);
        let encryptedKey = await NotesCrypto.encryptKey(key, salt);
        encryptedKey = encryptedKey.replaceAll("/","_");

        let [encryptedNote, iv] = await NotesCrypto.encryptNote(key,salt,newmemo);

        let res = await NotesApi.createMemo(encryptedKey, encryptedNote, iv);
        console.log(res);

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

async function populateMemos(){
    let key = document.getElementById('key-input').value;

    let keyHash = await NotesCrypto.hashKey(key);
    let salt = await NotesApi.getSalt(keyHash);
    let encryptedKey = await NotesCrypto.encryptKey(key, salt);
    encryptedKey = encryptedKey.replaceAll("/","_");

    let notes = await NotesApi.getMemos(encryptedKey);
    console.log(notes);

    //Reset list by deleting all but first note dom element
    for(let i=currentNotes.length-1; i>=1; i--){
        currentNotes[i].noteContainer.remove();
        currentNotes.pop();
    }
    currentNotes[0].noteContainer.getElementsByClassName('notes-input')[0].value="";

    for(let i=0; i<notes.length; i++){
        let currentContainer = null;
            
        if(i==0){
            currentContainer = currentNotes[i].noteContainer;
        }else{
            let previousContainer = currentNotes[i-1].noteContainer;
            currentContainer = previousContainer.cloneNode(true);
            previousContainer.insertAdjacentElement("afterend", currentContainer);
        }

        let note = notes[i];
        let decryptedNoteText = 
            await NotesCrypto.decryptNote(key, salt, note.iv, note.memobytes);
        
        let input = currentContainer.getElementsByClassName('notes-input')[0];
        input.value = decryptedNoteText;
        currentContainer.id = `notes-container-${note._id}`;
        input.id = `notes-input-${note._id}`;
        input.name = `notes-input-${note._id}`;

        if(i!=0){
            currentNotes.push(new NotesContainer(
                note, currentContainer
            ));
        }
    }
}


//List of each note, with the note object
var currentNotes = [];

function init(){
    
    let keySubmitButton = document.getElementById('key-submit-btn');
    keySubmitButton.addEventListener('click', () => runEncrypt());

    let getNotesButton = document.getElementById('get-notes-btn');
    getNotesButton.addEventListener('click', () => populateMemos());

    let ncElement = document.getElementsByClassName('notes-container')[0];
    currentNotes.push(new NotesContainer(
        null,
        ncElement
    ));

    //Provide access to my module functions
    //if we're debugging
    if(NOTES_DEBUG){
        window.NotesApi = NotesApi;
        window.NotesConvert = NotesConvert;
        window.NotesCrypto = NotesCrypto;
        window.bcrypt = dcodeIO.bcrypt;
        window.currentNotes = currentNotes;
    }
    console.log("Initialized");
}


window.onload = init;
