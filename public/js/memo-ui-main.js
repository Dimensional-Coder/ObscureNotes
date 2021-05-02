
/**
 * Entry point for Obscure Notes frontend.
 * Contains initialization logic for the ui
 * and communication with the backend.
 */

import {UiMemoDrag} from './memo-ui-drag.js';
import {UiMemoScreen} from './memo-ui-screen.js';
import {UiMemoBox} from './memo-ui-box.js';

const MEMO_DEBUG = true;

function initMemoButtons(){
    let deleteBtns = document.getElementsByClassName('memo-delete-btn');
    deleteBtns[0].addEventListener('click', UiMemoBox.deleteMemo);
    deleteBtns[0].addEventListener('mousedown', UiMemoDrag.interceptDrag);

    let addBtns = document.getElementsByClassName('memo-add-btn');
    addBtns[0].addEventListener('click', UiMemoBox.addMemo);
}

//Initialize memo boxes with listeners to
//be interactive
function initMemoBoxes(){
    let memoBoxes = document.getElementsByClassName('memos-box');
    for(let box of memoBoxes){
        box.addEventListener('mousedown', UiMemoDrag.startElementDrag);
    }

    let textAreas = document.getElementsByClassName('memo-input');
    for(let t of textAreas){
        t.addEventListener('mousedown', UiMemoDrag.interceptDrag, true);
        
        let memoResizeObserver = new ResizeObserver(UiMemoBox.redrawMemoScrollbar);
        memoResizeObserver.observe(t);
    }
}

function initViewScreens(){
    
    let startButton = document.getElementById('memos-start-btn');
    startButton.addEventListener('click', UiMemoScreen.triggerScreenTransition);

    let returnButton = document.getElementById('memos-return-btn');
    returnButton.addEventListener('click', UiMemoScreen.triggerScreenTransition);
}

function init(){
    initViewScreens();
    initMemoBoxes();
    initMemoButtons();

    if(MEMO_DEBUG){
        window.UiMemoDrag = UiMemoDrag;
        window.UiMemoScreen = UiMemoScreen;
        window.UiMemoBox = UiMemoBox;
    }
}

window.addEventListener('load', init);
