
const HASH_LENGTH = 5;

async function encryptKey(key, salt){
    let encrypted = await bcrypt.hash(key, salt);

    return Promise.resolve(encrypted);
}

async function getSalt(keyHash){
    let res = await fetch(`/salt/${keyHash}`, {
        method: 'GET'
    });
    
    let data = await res.json();
    console.log(data);

    return Promise.resolve(data.salt);
}

async function hashKey(key){
    let encoder = new TextEncoder('utf-8');
    let data = encoder.encode(key);

    let digest = await crypto.subtle.digest('SHA-1', data);

    //Convert bytes to a string
    let dataView = new DataView(digest);
    let digestStr = '';

    for(let i=0;i<dataView.byteLength;i++){
        digestStr += dataView.getUint8(i).toString(16);
    }

    let trimmed = digestStr.substring(0, HASH_LENGTH);
    //let trimmed = digestStr;

    return Promise.resolve(trimmed);
}

async function runEncrypt(){
    let key = document.getElementById('key-input').value;

    try{
        let keyHash = await hashKey(key);
        let salt = await getSalt(keyHash);
        let encrypted = await encryptKey(key, salt);

        //Display results on the page
        let hashResult = document.getElementById('hash-result');
        hashResult.innerHTML=keyHash;
        
        let saltResult = document.getElementById('salt-result');
        saltResult.innerHTML=salt;
        
        let encryptResult = document.getElementById('encrypt-result');
        encryptResult.innerHTML=encrypted;
    }
    catch(err){
        console.error(err);
    }
}

var bcrypt;

function init(){
    bcrypt = dcodeIO.bcrypt;

    keySubmitButton = document.getElementById('key-submit-btn');

    keySubmitButton.addEventListener('click', () => runEncrypt());

    console.log("Initialized")
}


window.onload = init;