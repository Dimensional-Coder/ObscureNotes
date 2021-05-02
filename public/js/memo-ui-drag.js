
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
        UiMemoDrag.currentDragTarget = new MemoBoxDrag(box, e.offsetX, e.offsetY);
        document.body.addEventListener('mousemove', UiMemoDrag.updateElementPos);
        document.body.addEventListener('mouseup', UiMemoDrag.endElementDrag);
        document.body.classList.add('dragging');
    
        console.log('Started element drag');
    
        console.log(`client coords: ${e.clientX},${e.clientY}`);
        console.log(`offset coords: ${e.offsetX},${e.offsetY}`);
    }
    
    static updateElementPos(e){
        let newX = e.clientX-UiMemoDrag.currentDragTarget.relativeX;
        let newY = e.clientY-UiMemoDrag.currentDragTarget.relativeY;
    
        UiMemoDrag.currentDragTarget.element.style.left = `${newX}px`;
        UiMemoDrag.currentDragTarget.element.style.top = `${newY}px`;
        //console.log(`Set pos to (${newX},${newY})`)
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