
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

    let appScreen = document.getElementById('memo-application-screen');
    appScreen.addEventListener('animationend', (e) =>{
        if(e.currentTarget.classList.contains('screen-active'))
            UiMemoBox.clearMemos();
    });
}

function openApp(){
    UiMemoScreen.transitionToApp()
    UiMemoBox.populateMemos()
}

function initViewScreens(){
    
    let startButton = document.getElementById('memos-start-btn');
    startButton.addEventListener('click', openApp);

    let keyInput = document.getElementById('memos-start-key-input')
    keyInput.addEventListener('keyup', function(e){
        if(e.key == "Enter"){
            openApp()
            keyInput.blur()
        }
    })

    let aboutButton = document.getElementById('memos-about-btn');
    aboutButton.addEventListener('click', UiMemoScreen.transitionToAbout);

    let changelogButton = document.getElementById('memos-changelog-btn');
    changelogButton.addEventListener('click', UiMemoScreen.transitionToChangelog);

    let appReturnButton = document.getElementById('memos-app-return-btn');
    appReturnButton.addEventListener('click', UiMemoScreen.transitionFromApp);

    let aboutReturnButton = document.getElementById('memos-about-return-btn');
    aboutReturnButton.addEventListener('click', UiMemoScreen.transitionFromAbout);

    let changelogReturnButton = document.getElementById('memos-changelog-return-btn');
    changelogReturnButton.addEventListener('click', UiMemoScreen.transitionFromChangelog);
}

function init(){
    initViewScreens();
    initApplicationScreen();

    let testBox = document.getElementById('memos-box-template');

    if(MEMO_DEBUG){
        window.UiMemoDrag = UiMemoDrag;
        window.UiMemoScreen = UiMemoScreen;
        window.UiMemoBox = UiMemoBox;
    }
}

window.addEventListener('load', init);
