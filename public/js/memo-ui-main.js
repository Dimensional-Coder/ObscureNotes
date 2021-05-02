
/**
 * Entry point for Obscure Notes frontend.
 * Contains initialization logic for the ui
 * and communication with the backend.
 */

import {UiMemoDrag} from './memo-ui-drag.js';
import {UiMemoScreen} from './memo-ui-screen.js';
import {UiMemoBox} from './memo-ui-box.js';

const MEMO_DEBUG = true;

/**
 * Wire scrollbar to redraw under certain conditions:
 *   - Memo box resize
 *   - Text area input (new/deleted lines)
 *   - Dragging the scrollbar
 *   - Scroll wheel
 */
function initMemoScrollbar(){
    //Box resize
    let textAreas = document.getElementsByClassName('memo-input');

    let memoResizeObserver = new ResizeObserver(UiMemoBox.inputResizeHandler);
    memoResizeObserver.observe(textAreas[0]);

    //Text area input
    //TODO

    //Scrollbar drag
    //TODO

    //Scroll wheel
    //TODO
}

function initApplicationScreen(){
    let addBtns = document.getElementsByClassName('memo-add-btn');
    addBtns[0].addEventListener('click', UiMemoBox.addMemo);
}

//Initialize memo boxes with listeners to
//be interactive
function initMemoBox(){
    let memoBoxes = document.getElementsByClassName('memos-box');
    for(let box of memoBoxes){
        box.addEventListener('mousedown', UiMemoDrag.startElementDrag);
    }

    let textAreas = document.getElementsByClassName('memo-input');
    for(let t of textAreas){
        t.addEventListener('mousedown', UiMemoDrag.interceptDrag, true);
    }

    let deleteBtns = document.getElementsByClassName('memo-delete-btn');
    deleteBtns[0].addEventListener('click', UiMemoBox.deleteMemo);
    deleteBtns[0].addEventListener('mousedown', UiMemoDrag.interceptDrag);
}

function initViewScreens(){
    
    let startButton = document.getElementById('memos-start-btn');
    startButton.addEventListener('click', UiMemoScreen.triggerScreenTransition);

    let returnButton = document.getElementById('memos-return-btn');
    returnButton.addEventListener('click', UiMemoScreen.triggerScreenTransition);
}

function init(){
    initViewScreens();
    initMemoBox();
    initApplicationScreen();
    initMemoScrollbar();

    if(MEMO_DEBUG){
        window.UiMemoDrag = UiMemoDrag;
        window.UiMemoScreen = UiMemoScreen;
        window.UiMemoBox = UiMemoBox;
    }
}

window.addEventListener('load', init);
