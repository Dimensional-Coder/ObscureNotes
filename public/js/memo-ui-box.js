
import {UiMemoDrag} from './memo-ui-drag.js';
import {UiMemoScrollbar} from './memo-ui-scrollbar.js';

import { MemoApi } from './memo-api.js';
import { MemoConvert } from './memo-convert.js';
import { MemoCrypto } from './memo-crypto.js';

//How long to wait before saving a memo
const SAVE_WAIT_TIME = 1000;

//Random x pos on the current viewport
function getRandomXPosition(forElement){
    let screen = document.getElementsByClassName('screen-active')[0];
    let screenWidth = parseInt(window.getComputedStyle(screen).width);
    let elemWidth = parseInt(window.getComputedStyle(forElement).width);

    let rpos = Math.random() * (screenWidth - elemWidth);
    return rpos;
}

//Random x pos on the current viewport
function getRandomYPosition(forElement){
    let screen = document.getElementsByClassName('screen-active')[0];
    let screenHeight = parseInt(window.getComputedStyle(screen).height);
    let elemHeight = parseInt(window.getComputedStyle(forElement).height);

    let rpos = Math.random() * (screenHeight - elemHeight);
    return rpos;
}

function getKey(){
    let keyInput = document.getElementById('memos-start-key-input');
    return keyInput.value;
}

export class UiMemoBox{

    static currentScrollDragTarget = null;

    //Recently modified memos that are scheduled to be saved.
    //These are timeout ids from setTimeout calls, see
    //scheduleSaveMemo()
    static scheduledMemoSaves = new Map();

    //Counter to assign ids to new memos that
    //aren't in the database yet
    static newMemoCounter = 0;

    /**
     * Create a new memo element by cloning the "template"
     * and inserting it into the dom.
     */
    static addMemoElement(){
        let boxTemplate = document.getElementById('memos-box-template');
        let boxContainer = document.getElementById('memo-main-box-container');

        let newMemoBox = boxTemplate.cloneNode(true);

        UiMemoBox.initMemoBox(newMemoBox);

        boxContainer.insertAdjacentElement('beforeend', newMemoBox);
        let input = newMemoBox.getElementsByClassName('memo-input')[0];

        newMemoBox.style.left = `${getRandomXPosition(newMemoBox)}px`;
        newMemoBox.style.top = `${getRandomYPosition(newMemoBox)}px`;
        
        //This will later be set to an identifier based
        //on the resource saved on the backend
        let newid = UiMemoBox.newMemoCounter++;        
        newMemoBox.id = `newmemo-box-${newid}`;
        input.name = `newmemo-input-${newid}`;
        input.id = `newmemo-input-${newid}`;
        
        console.log('Meme element created');
        return newMemoBox;
    }

    static deleteMemoElement(memoBox){
        //Event listeners should be automatically garbage collected
        memoBox.remove();

        console.log('Memo element deleted');
    }

    static addMemo(e){
        let newMemoBox = UiMemoBox.addMemoElement();

        e.stopPropagation();
    }
    
    static deleteMemo(e){
        
        let deleteBtn = e.currentTarget;
        let box = deleteBtn.closest('.memos-box');

        UiMemoBox.deleteMemoElement(box);

        e.stopPropagation();
    }

    static setMemoContent(memoBox, memo){

        let input = memoBox.getElementsByClassName('memo-input')[0];
        memoBox.id = `memo-box-${memo._id}`;
        input.name = `memo-input-${memo._id}`;
        input.id = `memo-input-${memo._id}`;
        input.value = memo.memotext;
    }

    /**
     * Encrypt the memo and save it to the backend.
     * @param {*} e 
     */
    static async saveMemo(memoInputId){
        let idIndex = memoInputId.lastIndexOf('-') + 1;
        let memoid = memoInputId.substring(idIndex, memoInputId.length);
        let update = true;
        if(memoInputId.indexOf('newmemo')!=-1){
            //this is a new memo
            update = false;
        }

        let input = document.getElementById(memoInputId);
        let box = input.closest('.memos-box');
        let memotext = input.value;

        let key = getKey();

        let keyHash = await MemoCrypto.hashKey(key);
        let salt = await MemoApi.getSalt(keyHash);
        let encryptedKey = await MemoCrypto.encryptKey(key, salt);

        let [encryptedMemo, iv] = await MemoCrypto.encryptNote(key,salt,memotext);

        if(!update){
            let res = await MemoApi.createMemo(encryptedKey, encryptedMemo, iv);

            //Now that this is a saved resource, update ids to
            //what this memo is identified by
            box.id = `memo-box-${res._id}`;
            input.id = `memo-input-${res._id}`;
            input.name = `memo-input-${res._id}`;

            //If memo was scheduled for an update, reschedule
            //with the newly created id
            let oldId = memoInputId;
            if(UiMemoBox.scheduledMemoSaves.has(oldId)){
                let oldTimeoutId = UiMemoBox.scheduledMemoSaves.get(oldId);
                window.clearTimeout(oldTimeoutId);

                UiMemoBox.scheduledMemoSaves.delete(oldId);
                let timeoutId = setTimeout(UiMemoBox.saveMemo, SAVE_WAIT_TIME, input.id);
                UiMemoBox.scheduledMemoSaves.set(input.id, timeoutId);
            }
            console.log(`New memo created (${res._id})`);
        }else{
            let res = await MemoApi.updateMemo(encryptedKey, memoid, encryptedMemo, iv);

            console.log(`Memo updated (${res._id})`);
        }
    }

    /**
     * On input event, schedule a memo to be saved to the backend.
     * If a save is already "scheduled", the timer is reset.
     * This is so the backend isn't spammed with requests on every
     * keystroke.
     */
    static scheduleSaveMemo(e){
        let inputId = e.currentTarget.id;

        if(UiMemoBox.scheduledMemoSaves.has(inputId)){
            //Already scheduled, reset the timer
            let oldTimeoutId = UiMemoBox.scheduledMemoSaves.get(inputId);
            window.clearTimeout(oldTimeoutId);
        }

        let timeoutId = setTimeout(UiMemoBox.saveMemo, SAVE_WAIT_TIME, inputId);
        UiMemoBox.scheduledMemoSaves.set(inputId, timeoutId);
    }

    static clearMemos(){
        let boxContainer = document.getElementById('memo-main-box-container');
        let boxes = boxContainer.getElementsByClassName('memos-box');

        for(let box of boxes){
            UiMemoBox.deleteMemoElement(box);
        }

        console.log('Memo elements cleared');
    }

    /**
     * Get memos from server, decrypt them,
     * then redraw memos on screen with plaintext memos.
     */
    static async populateMemos(e){
        let key = getKey();

        let keyHash = await MemoCrypto.hashKey(key);
        let salt = await MemoApi.getSalt(keyHash);
        let encryptedKey = await MemoCrypto.encryptKey(key, salt);

        let memos = await MemoApi.getMemos(encryptedKey);

        for(let memo of memos){
            let memoText = 
                await MemoCrypto.decryptNote(key, salt, memo.iv, memo.memobytes);
                memo.memotext = memoText;
        }

        UiMemoBox.clearMemos();

        for(let memo of memos){
            let memoBox = UiMemoBox.addMemoElement();
            UiMemoBox.setMemoContent(memoBox, memo);
        }

        console.log('Memos retrieved and decrypted');
    }

    //Initialize memo boxes with listeners to
    //be interactive
    static initMemoBox(box){
        box.addEventListener('mousedown', UiMemoDrag.startElementDrag);

        let inputContainer = box.getElementsByClassName('memo-input-container')[0];
        let input = inputContainer.getElementsByClassName('memo-input')[0];
        input.addEventListener('mousedown', UiMemoDrag.interceptDrag, true);
        input.addEventListener('input', UiMemoBox.scheduleSaveMemo);

        let deleteBtn = box.getElementsByClassName('memo-delete-btn')[0];
        deleteBtn.addEventListener('click', UiMemoBox.deleteMemo);
        deleteBtn.addEventListener('mousedown', UiMemoDrag.interceptDrag);

        let scrollbar = inputContainer.getElementsByClassName('memo-scrollbar')[0];
        UiMemoScrollbar.initMemoScrollbar(scrollbar);
    }
}