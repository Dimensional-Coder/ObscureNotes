
/**
 * Scripting for boxes in the main application
 * screen. Needs to be broken up, this file is
 * too large.
 */

import {UiMemoDrag} from './memo-ui-drag.js';
import {UiMemoScrollbar} from './memo-ui-scrollbar.js';
import {UiMemoError, MemoStatus} from './memo-ui-error.js';

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

function getMemoXPercent(memoBox){
    let screen = document.getElementsByClassName('screen-active')[0];

    let screenWidth = parseInt(window.getComputedStyle(screen).width);
    let memoX = parseInt(window.getComputedStyle(memoBox).left);

    return memoX/screenWidth;
}

function getMemoYPercent(memoBox){
    let screen = document.getElementsByClassName('screen-active')[0];

    let screenHeight = parseInt(window.getComputedStyle(screen).height);
    let memoY = parseInt(window.getComputedStyle(memoBox).top);

    return memoY/screenHeight;
}

function percentToScreenX(xPercent){
    let screen = document.getElementsByClassName('screen-active')[0];

    return parseInt(window.getComputedStyle(screen).width)*xPercent;
}

function percentToScreenY(yPercent){
    let screen = document.getElementsByClassName('screen-active')[0];

    return parseInt(window.getComputedStyle(screen).height)*yPercent;
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

    //z index counter to ensure any grabbed 
    //memo appears on the forefront
    static zIndexCounter = 1;

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
        
        console.log('Memo element created');
        return newMemoBox;
    }

    static async deleteMemo(memoBox){
        if(memoBox.id.indexOf('newmemo') != -1){
            //This memo was never saved to the database, ignore
            return;
        }
        
        let idIndex = memoBox.id.lastIndexOf('-') + 1;
        let memoid = memoBox.id.substring(idIndex, memoBox.id.length);

        let key = getKey();

        let keyHash = await MemoCrypto.hashKey(key);
        let salt = await MemoApi.getSalt(keyHash);
        let encryptedKey = await MemoCrypto.encryptKey(key, salt);

        let res = await MemoApi.deleteMemo(encryptedKey, memoid);

        //Remove scheduled save
        let input = memoBox.getElementsByClassName('memo-input')[0];
        if(UiMemoBox.scheduledMemoSaves.has(input.id)){
            UiMemoBox.scheduledMemoSaves.delete(input.id);
        }

        console.log(`Memo deleted from server ${memoid}`);
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
    
    static async deleteMemoHandler(e){
        
        let deleteBtn = e.currentTarget;
        let box = deleteBtn.closest('.memos-box');

        await UiMemoBox.deleteMemo(box);
        UiMemoBox.deleteMemoElement(box);

        e.stopPropagation();
    }

    static setMemoContent(memoBox, memo){

        let input = memoBox.getElementsByClassName('memo-input')[0];
        memoBox.id = `memo-box-${memo._id}`;
        input.name = `memo-input-${memo._id}`;
        input.id = `memo-input-${memo._id}`;
        input.value = memo.memotext;

        if(memo.memox){
            let x = percentToScreenX(memo.memox);
            memoBox.style.left = `${x}px`;
        }
        if(memo.memoy){
            let y = percentToScreenY(memo.memoy);
            memoBox.style.top = `${y}px`;
        }
        if(memo.memowidth){
            input.style.width = memo.memowidth;
        }
        if(memo.memoheight){
            input.style.height = memo.memoheight;
        }
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
        if(!input){
            //Element does not exist, ignore
            return;
        }

        let box = input.closest('.memos-box');
        let memotext = input.value;
        let memox = getMemoXPercent(box);
        let memoy = getMemoYPercent(box);
        let memowidth = input.style.width;
        let memoheight = input.style.height;

        let key = getKey();

        let keyHash = await MemoCrypto.hashKey(key);
        let salt = await MemoApi.getSalt(keyHash);
        let encryptedKey = await MemoCrypto.encryptKey(key, salt);

        let [encryptedMemo, iv] = await MemoCrypto.encryptNote(key,salt,memotext);

        try{
            if(!update){
                let res = await MemoApi.createMemo(
                    encryptedKey, encryptedMemo, iv,
                    memox, memoy, memowidth, memoheight
                );

                //Now that this is a saved resource, update ids to
                //what this memo is identified by
                box.id = `memo-box-${res._id}`;
                input.id = `memo-input-${res._id}`;
                input.name = `memo-input-${res._id}`;

                //If memo was scheduled for an update, reschedule
                //with the newly created id
                let oldId = memoInputId;
                if(UiMemoBox.scheduledMemoSaves.has(oldId)){
                    UiMemoBox.scheduleSaveMemo(box);
                }
                console.log(`New memo created (${res._id})`);
            }else{
                let res = await MemoApi.updateMemo(
                    encryptedKey, memoid, encryptedMemo, iv,
                    memox, memoy, memowidth, memoheight
                );

                console.log(`Memo updated (${res._id})`);
            }

            //Success
            UiMemoError.setMemoSaveStatus(box, MemoStatus.SUCCESS);
        }
        catch(error){
            console.error(error);
            console.error('Failed to create or update memo');
            UiMemoError.setMemoSaveStatus(box, MemoStatus.ERROR);
        }
    }

    /**
     * Schedule a memo to be saved to the backend.
     * If a save is already "scheduled", the timer is reset.
     * This is so the backend isn't spammed with requests on every
     * keystroke.
     */
    static scheduleSaveMemo(box){
        let input = box.getElementsByClassName('memo-input')[0];

        if(UiMemoBox.scheduledMemoSaves.has(input.id)){
            //Already scheduled, reset the timer
            let oldTimeoutId = UiMemoBox.scheduledMemoSaves.get(input.id);
            window.clearTimeout(oldTimeoutId);
            UiMemoBox.scheduledMemoSaves.delete(input.id);
        }

        let timeoutId = setTimeout(UiMemoBox.saveMemo, SAVE_WAIT_TIME, input.id);
        UiMemoBox.scheduledMemoSaves.set(input.id, timeoutId);
        UiMemoError.setMemoSaveStatus(box, MemoStatus.PROGRESS);
    }

    //Save memo when the input is changed
    static inputSaveHandler(e){
        let input = e.currentTarget;
        let box = input.closest('.memos-box');

        UiMemoBox.scheduleSaveMemo(box);
    }

    //Save memo when a memo box is moved
    static boxSaveHandler(e){
        let box = e.currentTarget;

        UiMemoBox.scheduleSaveMemo(box);
    }

    static clearMemos(){
        let boxContainer = document.getElementById('memo-main-box-container');
        let boxes = boxContainer.getElementsByClassName('memos-box');
        
        for(let i=boxes.length-1; i>=0; i--){
            let box = boxes[i];
            UiMemoBox.deleteMemoElement(box);
        }

        console.log('Memo elements cleared');
    }

    /**
     * Get memos from server, decrypt them,
     * then redraw memos on screen with plaintext memos.
     */
    static async populateMemos(e){
        UiMemoBox.clearMemos();
        UiMemoError.hideGenericError();

        let key = getKey();

        let keyHash = await MemoCrypto.hashKey(key);
        let salt = await MemoApi.getSalt(keyHash);
        let encryptedKey = await MemoCrypto.encryptKey(key, salt);

        let memos = null;
        try{
            memos = await MemoApi.getMemos(encryptedKey);

            for(let memo of memos){
                let memoText = 
                    await MemoCrypto.decryptNote(key, salt, memo.iv, memo.memobytes);
                    memo.memotext = memoText;
            }
        }catch(error){
            console.error(error);
            console.error('Failed to retrieve or decrypt memos, disabling display of memos');
            UiMemoError.showGenericError();
            
            return Promise.resolve();
        }
        

        for(let memo of memos){
            let memoBox = UiMemoBox.addMemoElement();
            UiMemoBox.setMemoContent(memoBox, memo);
            UiMemoError.setMemoSaveStatus(memoBox, MemoStatus.SUCCESS);
        }

        console.log('Memos retrieved and decrypted');
    }

    static bringMemoToFront(e){
        let box = e.currentTarget;
        box.style.zIndex = UiMemoBox.zIndexCounter++;
    }

    static bringInputToFront(e){
        let box = e.currentTarget.closest('.memos-box');
        box.style.zIndex = UiMemoBox.zIndexCounter++;
        e.stopPropagation();
    }

    //Initialize memo boxes with listeners to
    //be interactive
    static initMemoBox(box){
        box.addEventListener('mousedown', UiMemoDrag.startElementDrag);
        box.addEventListener('mousedown', UiMemoBox.bringMemoToFront);
        box.addEventListener('mouseup', UiMemoBox.boxSaveHandler);
        UiMemoError.setMemoSaveStatus(box, MemoStatus.INACTIVE);

        let inputContainer = box.getElementsByClassName('memo-input-container')[0];
        let input = inputContainer.getElementsByClassName('memo-input')[0];
        //input.addEventListener('mousedown', UiMemoDrag.interceptDrag);
        input.addEventListener('mousedown', UiMemoBox.bringInputToFront, true);
        input.addEventListener('input', UiMemoBox.inputSaveHandler);

        let deleteBtn = box.getElementsByClassName('memo-delete-btn')[0];
        deleteBtn.addEventListener('click', UiMemoBox.deleteMemoHandler);
        deleteBtn.addEventListener('mousedown', UiMemoDrag.interceptDrag);

        let scrollbar = inputContainer.getElementsByClassName('memo-scrollbar')[0];
        UiMemoScrollbar.initMemoScrollbar(scrollbar);
    }
}