
import {UiMemoDrag} from './memo-ui-drag.js';
import {UiMemoScrollbar} from './memo-ui-scrollbar.js';

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

export class UiMemoBox{

    static currentScrollDragTarget = null;

    /**
     * Create a new memo element by cloning the "template"
     * and inserting it into the dom.
     */
    static addMemo(e){
        console.log('New memo added');

        let boxTemplate = document.getElementById('memos-box-template');
        let boxContainer = document.getElementById('memo-main-box-container');

        let newMemoBox = boxTemplate.cloneNode(true);

        //This will later be set to an identifier based
        //on the resource saved on the backend
        newMemoBox.id = '';

        UiMemoBox.initMemoBox(newMemoBox);

        boxContainer.insertAdjacentElement('beforeend', newMemoBox);
        newMemoBox.style.left = `${getRandomXPosition(newMemoBox)}px`;
        newMemoBox.style.top = `${getRandomYPosition(newMemoBox)}px`;

        e.stopPropagation();
    }
    
    static deleteMemo(e){
        
        let deleteBtn = e.currentTarget;
        let box = deleteBtn.closest('.memos-box');

        //Event listeners should be automatically garbage collected
        box.remove();

        e.stopPropagation();
    }

    //Initialize memo boxes with listeners to
    //be interactive
    static initMemoBox(box){
        box.addEventListener('mousedown', UiMemoDrag.startElementDrag);

        let inputContainer = box.getElementsByClassName('memo-input-container')[0];
        let input = inputContainer.getElementsByClassName('memo-input')[0];
        input.addEventListener('mousedown', UiMemoDrag.interceptDrag, true);

        let deleteBtn = box.getElementsByClassName('memo-delete-btn')[0];
        deleteBtn.addEventListener('click', UiMemoBox.deleteMemo);
        deleteBtn.addEventListener('mousedown', UiMemoDrag.interceptDrag);

        let scrollbar = inputContainer.getElementsByClassName('memo-scrollbar')[0];
        UiMemoScrollbar.initMemoScrollbar(scrollbar);
    }
}