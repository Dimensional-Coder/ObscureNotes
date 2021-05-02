
/**
 * Entry point for Obscure Notes frontend.
 * Contains initialization logic for the ui
 * and communication with the backend.
 */

import {UiMemoDrag} from './memo-ui-drag.js';
import {UiMemoScreen} from './memo-ui-screen.js';
import {UiMemoBox} from './memo-ui-box.js';
import {UiMemoScrollbar} from './memo-ui-scrollbar.js';

const MEMO_DEBUG = true;


function initApplicationScreen(){
    let addBtns = document.getElementsByClassName('memo-add-btn');
    addBtns[0].addEventListener('click', UiMemoBox.addMemo);
}

function initViewScreens(){
    
    let startButton = document.getElementById('memos-start-btn');
    startButton.addEventListener('click', UiMemoScreen.triggerScreenTransition);

    let returnButton = document.getElementById('memos-return-btn');
    returnButton.addEventListener('click', UiMemoScreen.triggerScreenTransition);
}

function init(){
    initViewScreens();
    initApplicationScreen();

    let testBox = document.getElementById('memos-box-template');
    UiMemoBox.initMemoBox(testBox);

    if(MEMO_DEBUG){
        window.UiMemoDrag = UiMemoDrag;
        window.UiMemoScreen = UiMemoScreen;
        window.UiMemoBox = UiMemoBox;
    }
}

window.addEventListener('load', init);
