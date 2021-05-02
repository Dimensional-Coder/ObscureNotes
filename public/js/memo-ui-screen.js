

/**
 * Scripting for handling "screens", which are swappable
 * views in the frontend (single page application)
 */

export class UiMemoScreen{
    
    static hideScreen(e){
        let screen = e.currentTarget;
        screen.classList.remove('screen-active');
        screen.classList.add('screen-inactive');
        screen.style.animation = '';
    
        screen.removeEventListener('animationend', UiMemoScreen.hideScreen);
        console.log('Old screen hidden offscreen');
    }
    
    static anchorScreen(e){
        let screen = e.currentTarget;
        screen.classList.remove('screen-inactive');
        screen.classList.add('screen-active');
        screen.style.animation = '';
    
        screen.removeEventListener('animationend', UiMemoScreen.anchorScreen);
        console.log('New screen anchored in main view');
    }
    
    /**
     * Transition from current screen (identified by 'screen-active' class)
     * to the next screen.
     */
    static triggerScreenTransition(e){
        //There should be only one "active" screen
        let currentScreen = document.getElementsByClassName('screen-active')[0];
    
        //Find next screen element, which will be the new screen
        let allScreens = document.getElementsByClassName('memo-screen');
        let currentIndex = Array.prototype.indexOf.call(allScreens, currentScreen);
    
        if(currentIndex == -1){
            console.error('Failed to find index of the current screen, can\'t transition');
            return;
        }
    
        let nextIndex = (currentIndex+1)%allScreens.length;
        let nextScreen = allScreens[nextIndex];
    
        //Trigger enter and exit animations for screens.
        //Animations are defined in memo-animations.css
        currentScreen.addEventListener('animationend', UiMemoScreen.hideScreen);
        nextScreen.addEventListener('animationend', UiMemoScreen.anchorScreen);
        currentScreen.style.animation = 'screen-begone 2s ease-in-out 1s 1';
        nextScreen.style.animation = 'screen-bootycall 2s ease-in-out 1s 1';
    
        console.log('Screen transition started');
    }
}