
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
}

function anchorScreen(e){
    let screen = e.currentTarget;
    screen.classList.remove('screen-inactive');
    screen.classList.add('screen-active');
    screen.style.animation = '';

    screen.removeEventListener('animationend', anchorScreen);
    console.log('anchor called')
}

function startScreenTransition(e){
    let splashScreen = document.getElementById('memo-splash-screen');
    splashScreen.addEventListener('animationend', hideScreen);

    let appScreen = document.getElementById('memo-application-screen');
    appScreen.addEventListener('animationend', anchorScreen);

    //Animations defined in memo-animations.css
    splashScreen.style.animation = 'screen-begone 2s ease-in-out 1s 1';
    appScreen.style.animation = 'screen-bootycall 2s ease-in-out 1s 1';

    console.log('Registered animations');
}

function initViewScreens(){

    let startButton = document.getElementById('key-submit-btn');
    startButton.addEventListener('click', startScreenTransition);
}

function init(){
    //initBgBoxes();
    initViewScreens();
}

window.onload = init;
