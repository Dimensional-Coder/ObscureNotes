

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
     * Transition from splash screen to the app screen (or back).
     */
     static appTransition(reverse = false){
        let splashScreen = document.getElementById('memo-splash-screen');
        let appScreen = document.getElementById('memo-application-screen');

        if(!reverse){
            splashScreen.addEventListener('animationend', UiMemoScreen.hideScreen);
            appScreen.addEventListener('animationend', UiMemoScreen.anchorScreen);
            
            splashScreen.style.animation = 'screen-splash-left 2s ease-in-out 1s 1';
            appScreen.style.animation = 'screen-app-enter 2s ease-in-out 1s 1';
            console.log('Screen transition from splash page to app started');
        }else{
            appScreen.addEventListener('animationend', UiMemoScreen.hideScreen);
            splashScreen.addEventListener('animationend', UiMemoScreen.anchorScreen);

            //play animation in reverse if going back to splash screen
            splashScreen.style.animation = 'screen-splash-left 2s ease-in-out 1s 1 reverse';
            appScreen.style.animation = 'screen-app-enter 2s ease-in-out 1s 1 reverse';
            console.log('Screen transition from app to splash page started');
        }
    }

    /**
     * Transition from splash screen to the about screen (or back).
     */
     static aboutTransition(reverse = false){
        let splashScreen = document.getElementById('memo-splash-screen');
        let aboutScreen = document.getElementById('memo-about-screen');

        if(!reverse){
            splashScreen.addEventListener('animationend', UiMemoScreen.hideScreen);
            aboutScreen.addEventListener('animationend', UiMemoScreen.anchorScreen);
            
            splashScreen.style.animation = 'screen-splash-up 2s ease-in-out 1s 1';
            aboutScreen.style.animation = 'screen-about-enter 2s ease-in-out 1s 1';
            console.log('Screen transition from splash page to about started');
        }else{
            aboutScreen.addEventListener('animationend', UiMemoScreen.hideScreen);
            splashScreen.addEventListener('animationend', UiMemoScreen.anchorScreen);

            //play animation in reverse if going back to splash screen
            splashScreen.style.animation = 'screen-splash-up 2s ease-in-out 1s 1 reverse';
            aboutScreen.style.animation = 'screen-about-enter 2s ease-in-out 1s 1 reverse';
            console.log('Screen transition from about to splash page started');
        }
    }

    /**
     * Transition from splash screen to the changelog screen (or back).
     */
     static changelogTransition(reverse = false){
        let splashScreen = document.getElementById('memo-splash-screen');
        let changeScreen = document.getElementById('memo-changelog-screen');

        if(!reverse){
            splashScreen.addEventListener('animationend', UiMemoScreen.hideScreen);
            changeScreen.addEventListener('animationend', UiMemoScreen.anchorScreen);
            
            splashScreen.style.animation = 'screen-splash-right 2s ease-in-out 1s 1';
            changeScreen.style.animation = 'screen-changelog-enter 2s ease-in-out 1s 1';
            console.log('Screen transition from splash page to changelog started');
        }else{
            changeScreen.addEventListener('animationend', UiMemoScreen.hideScreen);
            splashScreen.addEventListener('animationend', UiMemoScreen.anchorScreen);

            //play animation in reverse if going back to splash screen
            splashScreen.style.animation = 'screen-splash-right 2s ease-in-out 1s 1 reverse';
            changeScreen.style.animation = 'screen-changelog-enter 2s ease-in-out 1s 1 reverse';
            console.log('Screen transition from changelog to splash page started');
        }
    }

    static transitionToApp(e){
        UiMemoScreen.appTransition(false);
    }

    static transitionFromApp(e){
        UiMemoScreen.appTransition(true);
    }

    static transitionToAbout(e){
        UiMemoScreen.aboutTransition(false);
    }

    static transitionFromAbout(e){
        UiMemoScreen.aboutTransition(true);
    }

    static transitionToChangelog(e){
        UiMemoScreen.changelogTransition(false);
    }

    static transitionFromChangelog(e){
        UiMemoScreen.changelogTransition(true);
    }
    
}