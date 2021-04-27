
function setRandomStartPosition(e){
    let newpos = Math.random()*100;

    let box = e.currentTarget;
    box.style.setProperty('left', `${newpos}vw`);
}

function init(){
    let bgBoxes = document.getElementsByClassName('memos-bg-box');

    let curDelay = 0;
    let delayInc = 2;

    for(let box of bgBoxes){
        box.addEventListener("animationstart", setRandomStartPosition, false);
        box.style.setProperty('animation-delay', `${curDelay}s`);
        curDelay+=delayInc;
    }
}

window.onload = init;
