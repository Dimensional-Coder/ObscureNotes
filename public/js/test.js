
function setRandomStartPosition(e){
    let newpos = Math.random()*100;

    let box = e.currentTarget;
    box.style.setProperty('left', `${newpos}vw`);
}

//Initialize bg boxes to have random placement
//for the animations
function initBgBoxes(){
    let bgBoxes = document.getElementsByClassName('memos-bg-box');

    let curDelay = 0;
    let delayInc = 2;

    for(let box of bgBoxes){
        box.addEventListener("animationstart", setRandomStartPosition, false);
        box.style.setProperty('animation-delay', `${curDelay}s`);
        curDelay+=delayInc;
    }
}

function hideScreen(e){
    let screen = e.currentTarget;
    screen.classList.remove('screen-active');
    screen.classList.add('screen-inactive');
    screen.style.animation = '';

    screen.removeEventListener('animationend', hideScreen);
    console.log('Old screen hidden offscreen');
}

function anchorScreen(e){
    let screen = e.currentTarget;
    screen.classList.remove('screen-inactive');
    screen.classList.add('screen-active');
    screen.style.animation = '';

    screen.removeEventListener('animationend', anchorScreen);
    console.log('New screen anchored in main view');
}

/**
 * Transition from current screen (identified by 'screen-active' class)
 * to the next screen.
 */
function triggerScreenTransition(e){

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
    currentScreen.addEventListener('animationend', hideScreen);
    nextScreen.addEventListener('animationend', anchorScreen);
    currentScreen.style.animation = 'screen-begone 2s ease-in-out 1s 1';
    nextScreen.style.animation = 'screen-bootycall 2s ease-in-out 1s 1';

    console.log('Screen transition started');
}

function initViewScreens(){

    let startButton = document.getElementById('key-submit-btn');
    startButton.addEventListener('click', triggerScreenTransition);

    let returnButton = document.getElementById('return-btn');
    returnButton.addEventListener('click', triggerScreenTransition);
}

function init(){
    //initBgBoxes();
    initViewScreens();
}

window.onload = init;
