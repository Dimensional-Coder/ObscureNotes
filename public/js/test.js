
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

function setRandomStartPosition(e){
    let newpos = Math.random()*100;

    let box = e.currentTarget;
    box.style.setProperty('left', `${newpos}vw`);
}

function startElementDrag(e){
    let box = e.currentTarget;
    currentDragTarget = new MemoBoxDrag(box, e.offsetX, e.offsetY);
    document.body.addEventListener('mousemove', updateElementPos);
    document.body.addEventListener('mouseup', endElementDrag);
    document.body.classList.add('dragging');

    console.log('Started element drag');

    console.log(`client coords: ${e.clientX},${e.clientY}`);
    console.log(`offset coords: ${e.offsetX},${e.offsetY}`);
}

function updateElementPos(e){
    let newX = e.clientX-currentDragTarget.relativeX;
    let newY = e.clientY-currentDragTarget.relativeY;

    currentDragTarget.element.style.left = `${newX}px`;
    currentDragTarget.element.style.top = `${newY}px`;
    //console.log(`Set pos to (${newX},${newY})`)
}

function endElementDrag(e){
    if(currentDragTarget == null){
        console.error('No drag target, ignoring endElementDrag event handler');
        return;
    }
    currentDragTarget = null;

    document.body.removeEventListener('mousemove', updateElementPos);
    document.body.removeEventListener('mouseup', endElementDrag);
    document.body.classList.remove('dragging');
    console.log('Ended element drag');
}

//For use with input elements on a memo box,
//to prevent dragging while trying to interact
//with it
function interceptDrag(e){
    //Stop event from bubbling up
    e.stopPropagation();
}

//Initialize memo boxes with listeners to
//be interactive
function initMemoBoxes(){
    let memoBoxes = document.getElementsByClassName('memos-box');
    for(let box of memoBoxes){
        box.addEventListener('mousedown', startElementDrag);
    }

    let textAreas = document.getElementsByClassName('memo-input-container');
    for(let t of textAreas){
        t.addEventListener('mousedown', interceptDrag, true);
    }
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
    initMemoBoxes();
}

let currentDragTarget = null;
window.onload = init;
