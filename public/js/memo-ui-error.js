
/**
 * Scripting to show application errors.
 */
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

    static setMemoSaveStatus(status){
        //TODO: Implement this.
    }
}
