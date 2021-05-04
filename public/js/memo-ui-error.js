
/**
 * Scripting to show application errors.
 */

export const MemoStatus = {
    SUCCESS:   3,
    PROGRESS:  2,
    ERROR:     1,
    INACTIVE:  0
}

export class UiMemoError{
    

    /**
     * Show generic popup barring use of the main
     * application screen.
     */
    static showGenericError(){
        let errorContainer = document.getElementById('memo-application-error');
        errorContainer.classList.add('error-active');
        errorContainer.classList.remove('error-inactive');
    }

    static hideGenericError(){
        let errorContainer = document.getElementById('memo-application-error');
        errorContainer.classList.add('error-inactive');
        errorContainer.classList.remove('error-active');
    }

    static setMemoSaveStatus(memoBox, status){
        let statusElem = memoBox.getElementsByClassName('memo-status')[0];
        let currentStatus = null;
        for(let c of statusElem.classList){
            if(c.indexOf('memo-status-') != -1){
                currentStatus = c;
                break;
            }
        }

        switch(status){
            case(MemoStatus.SUCCESS):
                statusElem.classList.replace(currentStatus, 'memo-status-success');
                break;
            case(MemoStatus.PROGRESS):
                statusElem.classList.replace(currentStatus, 'memo-status-progress');
                break;
            case(MemoStatus.ERROR):
                statusElem.classList.replace(currentStatus, 'memo-status-error');
                break;
            case(MemoStatus.INACTIVE):
                statusElem.classList.replace(currentStatus, 'memo-status-inactive');
                break;
        }
    }
}
