
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
    static redrawMemoScrollbar(scrollbar){

        let input = scrollbar.closest('.memo-input-container')
                    .getElementsByClassName('memo-input')[0];

        if(input.scrollHeight==input.clientHeight){
            //No overflow, no scrollbar should be present
            scrollbar.classList.remove('scrollbar-active');
            scrollbar.classList.add('scrollbar-inactive');
            return;
        }
    
        //There is overflow, draw the scrollbar
    
        //Current position in overflow determines scrollbar position
        let maxScrollPos = input.scrollHeight-input.clientHeight;
        let curScrollPos = input.scrollTop;
        let scrollPercent = curScrollPos/maxScrollPos;

        //Proportion of element height to overflow height determines scrollbar scale
        let scrollbarSize = input.clientHeight/input.scrollHeight;
        
        let scrollTopElem = scrollbar.getElementsByClassName('drawing-scrollbar-top')[0];
        let scrollMiddleElem = scrollbar.getElementsByClassName('drawing-scrollbar-middle')[0];

        //Determine how much free space is in the scrollbar container
        let scrollContainerHeight = parseInt(window.getComputedStyle(scrollbar).height);
        let scrollTopHeight = parseInt(window.getComputedStyle(scrollTopElem).height);
        let scrollMiddleHeight = parseInt(window.getComputedStyle(scrollMiddleElem).height);

        //Use margin to position scrollbar based on amount of free space
        let freeSpace = scrollContainerHeight - scrollMiddleHeight - scrollTopHeight - scrollTopHeight;
        let marginAmount = freeSpace * scrollPercent;

        scrollTopElem.style.marginTop = `${marginAmount}px`;
        scrollMiddleElem.style.height = `${scrollbarSize*100}%`;
        scrollbar.classList.remove('scrollbar-inactive');
        scrollbar.classList.add('scrollbar-active');

        console.log('Resized scrollbar');
    }

    static inputResizeHandler(entries){
        let input = entries[0].target;

        let scrollbar = input.closest('.memo-input-container')
                        .getElementsByClassName('memo-scrollbar')[0];
        
        UiMemoBox.redrawMemoScrollbar(scrollbar);
    }

    static scrollbarDragStart(e){

    }

    static scrollbarDragEnd(e){

    }
}