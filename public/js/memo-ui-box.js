
/**
 * Scripting to handle operations on or in
 * memo box elements.
 */

export class UiMemoBox{
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
    
    /**
     * Redraw the custom scrollbar based on the
     * scroll height and current scroll position.
     */
    static redrawMemoScrollbar(memoScrollbar){
        // if(memoScrollbar.scrollHeight==memoScrollbar.clientHeight){
        //     //No scrollbar should be present as there
        //     //is no overflow
        //     memoScrollbar.classList.remove('scrollbar-active');
        //     memoScrollbar.classList.add('scrollbar-inactive');
        //     return;
        // }
    
        // memoScrollbar.classList.remove('scrollbar-inactive');
        // memoScrollbar.classList.add('scrollbar-active');
    
        // let maxScrollPos = memoScrollbar.scrollHeight-memoScrollbar.clientHeight;
        // let curScrollPos = memoScrollbar.scrollTop;
    
        // let scrollPercent = curScrollPos/maxScrollPos;
        // let scrollbarSize = memoScrollbar.clientHeight/memoScrollbar.scrollHeight;
    
        //Not yet complete
    }
}