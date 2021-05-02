
/**
 * Scripting to handle operations on or in
 * memo box elements.
 */

 class MemoScrollbarDrag{
    //Scrollbar element being dragged
    scrollbar = null;

    //Y position clicked on the element
    relativeY = null;

    //The text input being scrolled
    input = null;

    //Height in pixels of the scrollbar
    //at time of grabbing
    scrollbarHeight = null;

    //Relative position, in pixels, of the
    //middle point on the y axis
    scrollbarMiddle = null;

    //scrollbar container
    inputContainer = null;

    constructor(scrollbar, relativeY, input, scrollbarHeight, scrollbarMiddle, inputContainer){
        this.scrollbar=scrollbar;
        this.relativeY=relativeY;
        this.input=input;
        this.scrollbarHeight=scrollbarHeight;
        this.scrollbarMiddle=scrollbarMiddle;
        this.inputContainer=inputContainer;
    }
}

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

    //Shameful, basically copied my memo drag code for this.
    //Code is similar but subtly different enough that it can't
    //be reused
    static scrollbarDragStart(e){
        let scrollbar = e.currentTarget;
        let inputContainer = scrollbar.closest('.memo-input-container');
        let input = inputContainer.getElementsByClassName('memo-input')[0];
        
        //Sum up computed heights of drawn scrollbar elements
        let scrollbarHeight = 0;
        for(let part of scrollbar.getElementsByClassName('memo-scrollbar-component')){
            let computed = window.getComputedStyle(part);
            scrollbarHeight += parseInt(computed.height);
        }

        let scrollbarMiddle = scrollbarHeight/2;

        UiMemoBox.currentScrollDragTarget = new MemoScrollbarDrag(
            scrollbar, e.offsetY, input, scrollbarHeight, scrollbarMiddle, inputContainer
        );

        document.body.addEventListener('mousemove', UiMemoBox.scrollbarDragUpdate);
        document.body.addEventListener('mouseup', UiMemoBox.scrollbarDragEnd);
        //document.body.classList.add('dragging');
    
        //Prevent memo drag event
        e.stopPropagation();

        console.log('Started scrollbar drag');
    }

    static scrollbarDragUpdate(e){
        //New scrollbar pos based on mouse position
        let distToMid = UiMemoBox.currentScrollDragTarget.scrollbarMiddle 
                        - UiMemoBox.currentScrollDragTarget.relativeY;
        let newY = e.clientY+distToMid;
    
        //Use computed bounding box to get y position of container
        let boundingRect = 
            UiMemoBox.currentScrollDragTarget.scrollbar.getBoundingClientRect();
        let relativeNewY = newY - boundingRect.top;

        //Scrollbar height can't go above the container, so
        //scrollbar height determines max/min y inside container
        let minY = UiMemoBox.currentScrollDragTarget.scrollbarHeight/2;
        let maxY = boundingRect.height - (UiMemoBox.currentScrollDragTarget.scrollbarHeight/2);
        
        //normalize the relative y between the bounds of the container
        //to get our "scroll percent" for the text area.
        // n = (Y - Ymin) / (Ymax - Ymin)
        let scrollPercent = (relativeNewY-minY)/(maxY-minY);
        if(scrollPercent>1.0) scrollPercent = 0.99;

        //scroll the overflow content and redraw
        let input = UiMemoBox.currentScrollDragTarget.input;
        let maxScrollPos = input.scrollHeight-input.clientHeight;
        input.scrollTop = maxScrollPos * scrollPercent;

        console.log(`relativeNewY(${relativeNewY}), minY(${minY}), maxY(${maxY})`);
        console.log(`scrollPercent(${scrollPercent}), maxScrollPos(${maxScrollPos})`);
        UiMemoBox.redrawMemoScrollbar(UiMemoBox.currentScrollDragTarget.scrollbar);
    }

    static scrollbarDragEnd(e){
        if(UiMemoBox.currentScrollDragTarget == null){
            console.error('No scroll drag target, ignoring scrollbarDragEnd event handler');
            return;
        }
        UiMemoBox.currentDragTarget = null;
    
        document.body.removeEventListener('mousemove', UiMemoBox.scrollbarDragUpdate);
        document.body.removeEventListener('mouseup', UiMemoBox.scrollbarDragEnd);
        //document.body.classList.remove('dragging');
        console.log('Ended scrollbar drag');
    }
}