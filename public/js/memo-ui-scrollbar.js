
/**
 * Scripting for the scrollbar. Dragging and
 * resizing.
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

export class UiMemoScrollbar{
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

        //Another way to get scrollPercent, but it seems to be buggy on firefox
        //let scrollPercent = (input.scrollTop + input.offsetHeight) / input.scrollHeight;

        //Proportion of element height to overflow height determines scrollbar scale
        let scrollbarSize = input.clientHeight/input.scrollHeight;
        
        let scrollTopElem = scrollbar.getElementsByClassName('drawing-scrollbar-top')[0];
        let scrollMiddleElem = scrollbar.getElementsByClassName('drawing-scrollbar-middle')[0];

        //Determine how much free space is in the scrollbar container
        let scrollContainerHeight = parseInt(window.getComputedStyle(scrollbar).height);
        let scrollTopHeight = parseInt(window.getComputedStyle(scrollTopElem).height);
        //Update middleelem early since it may have grown and we need an updated number
        //scrollMiddleElem.style.height = `${scrollbarSize*100}%`;
        let maxMiddleHeight = scrollContainerHeight - scrollTopHeight - scrollTopHeight - 1;
        scrollMiddleElem.style.height = `${maxMiddleHeight*scrollbarSize}px`;
        let scrollMiddleHeight = parseInt(window.getComputedStyle(scrollMiddleElem).height);

        //Use margin to position scrollbar based on amount of free space
        let freeSpace = scrollContainerHeight - scrollMiddleHeight - scrollTopHeight - scrollTopHeight - 1;
        let marginAmount = freeSpace * scrollPercent;

        //TODO: Fix bug where scrollTop only changes on the second
        //character of a newline. Also a bug with the margin on firefox while typing...
        // console.log(`freeSpace(${freeSpace}), scrollPercent(${scrollPercent}), scrollbarSize(${scrollbarSize})`);
        // console.log(`input.clientHeight(${input.clientHeight}), input.scrollHeight(${input.scrollHeight})`);
        // console.log(`scrollContainerHeight(${scrollContainerHeight}), scrollMiddleHeight(${scrollMiddleHeight}), scrollTopHeight(${scrollTopHeight})`);


        // console.log(`input.scrollTop(${input.scrollTop})`);

        scrollTopElem.style.marginTop = `${marginAmount}px`;
        scrollbar.classList.remove('scrollbar-inactive');
        scrollbar.classList.add('scrollbar-active');

        console.log('Resized scrollbar');
    }

    static inputResizeHandler(entries){
        let input = entries[0].target;

        let scrollbar = input.closest('.memo-input-container')
                        .getElementsByClassName('memo-scrollbar')[0];
        
        UiMemoScrollbar.redrawMemoScrollbar(scrollbar);
    }

    static inputChangeHandler(e){
        let input = e.currentTarget;
        let scrollbar = input.closest('.memo-input-container')
                        .getElementsByClassName('memo-scrollbar')[0];
        
        UiMemoScrollbar.redrawMemoScrollbar(scrollbar);
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

        UiMemoScrollbar.currentScrollDragTarget = new MemoScrollbarDrag(
            scrollbar, e.offsetY, input, scrollbarHeight, scrollbarMiddle, inputContainer
        );

        document.body.addEventListener('mousemove', UiMemoScrollbar.scrollbarDragUpdate);
        document.body.addEventListener('mouseup', UiMemoScrollbar.scrollbarDragEnd);
        //document.body.classList.add('dragging');
    
        //Prevent memo drag event
        e.stopPropagation();

        console.log('Started scrollbar drag');
    }

    static scrollbarDragUpdate(e){
        //New scrollbar pos based on mouse position
        let distToMid = UiMemoScrollbar.currentScrollDragTarget.scrollbarMiddle 
                        - UiMemoScrollbar.currentScrollDragTarget.relativeY;
        let newY = e.clientY+distToMid;
    
        //Use computed bounding box to get y position of container
        let boundingRect = 
            UiMemoScrollbar.currentScrollDragTarget.scrollbar.getBoundingClientRect();
        let relativeNewY = newY - boundingRect.top;

        //Scrollbar height can't go above the container, so
        //scrollbar height determines max/min y inside container
        let minY = UiMemoScrollbar.currentScrollDragTarget.scrollbarHeight/2;
        let maxY = boundingRect.height - (UiMemoScrollbar.currentScrollDragTarget.scrollbarHeight/2);
        
        //normalize the relative y between the bounds of the container
        //to get our "scroll percent" for the text area.
        // n = (Y - Ymin) / (Ymax - Ymin)
        let scrollPercent = (relativeNewY-minY)/(maxY-minY);
        if(scrollPercent>1.0) scrollPercent = 0.99;

        //scroll the overflow content and redraw
        let input = UiMemoScrollbar.currentScrollDragTarget.input;
        let maxScrollPos = input.scrollHeight-input.clientHeight;
        input.scrollTop = maxScrollPos * scrollPercent;

        UiMemoScrollbar.redrawMemoScrollbar(UiMemoScrollbar.currentScrollDragTarget.scrollbar);
    }

    static scrollbarDragEnd(e){
        if(UiMemoScrollbar.currentScrollDragTarget == null){
            console.error('No scroll drag target, ignoring scrollbarDragEnd event handler');
            return;
        }
        UiMemoScrollbar.currentDragTarget = null;
    
        document.body.removeEventListener('mousemove', UiMemoScrollbar.scrollbarDragUpdate);
        document.body.removeEventListener('mouseup', UiMemoScrollbar.scrollbarDragEnd);
        //document.body.classList.remove('dragging');
        console.log('Ended scrollbar drag');
    }

    /**
     * Wire scrollbar to redraw under certain conditions:
     *   - Memo box resize
     *   - Text area input (new/deleted lines)
     *   - Dragging the scrollbar
     *   - Scroll wheel
     */
    static initMemoScrollbar(scrollbar){

        let input = scrollbar.closest('.memo-input-container')
                    .getElementsByClassName('memo-input')[0];

        //Box resize
        let memoResizeObserver = new ResizeObserver(UiMemoScrollbar.inputResizeHandler);
        memoResizeObserver.observe(input);

        //Text area input
        input.addEventListener('keydown', UiMemoScrollbar.inputChangeHandler);
        //TODO: Page up/pagedown

        //Scrollbar drag
        scrollbar.addEventListener('mousedown', UiMemoScrollbar.scrollbarDragStart);

        //Scroll wheel
        //TODO
    }
}