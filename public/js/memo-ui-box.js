
import {UiMemoDrag} from './memo-ui-drag.js';
import {UiMemoScrollbar} from './memo-ui-scrollbar.js';

export class UiMemoBox{

    static currentScrollDragTarget = null;

    static addMemo(e){
        //stub
        console.log('Add memo');
        e.stopPropagation();
    }
    
    static deleteMemo(e){
        //stub
        console.log('Delete memo');
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