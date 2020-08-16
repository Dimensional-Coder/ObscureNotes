
const WAIT_TIME = 1000;
let encryptTimeout = null;

window.onload = function(){
    document.getElementById('encrypt-value').oninput = scheduleEncrypt;
    document.getElementById('encrypt-key').oninput = scheduleEncrypt;

    document.getElementById('decrypt-value').oninput = decryptHex;
    document.getElementById('decrypt-key').oninput = decryptHex;
}

function scheduleEncrypt(){
    document.getElementById('encrypt-output').innerHTML = "";

    if(encryptTimeout != null){
        console.log("Rescheduling encrypt")
        window.clearTimeout(encryptTimeout);
    }else{
        console.log("Scheduling encrypt");
    }
    
    encryptTimeout = setTimeout(encryptValues, WAIT_TIME);
}

function encryptValues(){
    console.log("Encrypting");

    let input = document.getElementById('encrypt-value').value;
    let key = document.getElementById('encrypt-key').value;
    if(input.length==0 || key.length==0)
        return;

    let crypt = twofish()
    let cinput = crypt.stringToByteArray(input),
        ckey = crypt.stringToByteArray(key);

    let encrypted = crypt.encrypt(ckey, cinput);
    
    document.getElementById('encrypt-output').innerHTML 
        = toHexString(encrypted);
    
    encryptTimeout = null;
}

function decryptHex(){
    console.log("Decrypting");
    document.getElementById('decrypt-output').innerHTML = "";

    let input = document.getElementById('decrypt-value').value;
    let key = document.getElementById('decrypt-key').value;
    if(input.length==0 || key.length==0)
        return;

    let crypt = twofish()
    let cinput = toHexArr(input),
        ckey = crypt.stringToByteArray(key);

    let decrypted = crypt.decrypt(ckey, cinput);
    
    document.getElementById('decrypt-output').innerHTML 
        = `"${crypt.byteArrayToString(decrypted)}"`;
}

function toHexString(numArr){
    let str = "";

    for(let num of numArr)
        str += num.toString(16).padStart(2,"0");
    
    return str;
}

function toHexArr(numStr){
    let arr = []
    for(let i=0; i<numStr.length; i+=2){
        let str = numStr.substring(i,i+2);
        arr.push(Number.parseInt(str, 16));
    }

    return arr;
}
