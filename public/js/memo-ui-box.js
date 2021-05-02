
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
}