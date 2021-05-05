
/**
 * Scripting for handling memos being dragged by
 * the cursor.
 */

//Private class for storing state on the current dragged element
class MemoBoxDrag{
    //Memo element being dragged
    element = null;

    //X position clicked on the element
    relativeX = null;

    //Y position clicked on the element
    relativeY = null;

    constructor(element, offsetX, offsetY){
        this.element=element;
        this.relativeX=offsetX;
        this.relativeY=offsetY;
    }
}

export class UiMemoDrag{

    static currentDragTarget = null;
    
    static startElementDrag(e){
        let box = e.currentTarget;

        let computed = window.getComputedStyle(box);
        let relativeX = e.clientX - parseInt(computed.left);
        let relativeY = e.clientY - parseInt(computed.top);
        
        UiMemoDrag.currentDragTarget = new MemoBoxDrag(box, relativeX, relativeY);
        document.body.addEventListener('mousemove', UiMemoDrag.updateElementPos);
        document.body.addEventListener('mouseup', UiMemoDrag.endElementDrag);
        document.body.classList.add('dragging');
    
        console.log('Started element drag');
    }
    
    static updateElementPos(e){
        let newX = e.clientX-UiMemoDrag.currentDragTarget.relativeX;
        let newY = e.clientY-UiMemoDrag.currentDragTarget.relativeY;
    
        UiMemoDrag.currentDragTarget.element.style.left = `${newX}px`;
        UiMemoDrag.currentDragTarget.element.style.top = `${newY}px`;
    }
    
    static endElementDrag(e){
        if(UiMemoDrag.currentDragTarget == null){
            console.error('No drag target, ignoring endElementDrag event handler');
            return;
        }
        UiMemoDrag.currentDragTarget = null;
    
        document.body.removeEventListener('mousemove', UiMemoDrag.updateElementPos);
        document.body.removeEventListener('mouseup', UiMemoDrag.endElementDrag);
        document.body.classList.remove('dragging');
        console.log('Ended element drag');
    }
    
    //For use with input elements on a memo box,
    //to prevent dragging while trying to interact
    //with it
    static interceptDrag(e){
        //Stop event from bubbling up
        e.stopPropagation();
    }
}