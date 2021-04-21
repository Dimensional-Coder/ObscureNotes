
//
//notes-api.js - Module to serve as a wrapper for api calls.
//

export class NotesApi{
    /**
     * Get the salt tied to this key's hash.
     * 
     * @param {*} keyHash Hashed, truncated version of the keyphrase
     * @returns Salt, as a hex string
     */
    static async getSalt(keyHash){
        let res = await fetch(`/salt/${keyHash}`, {
            method: 'GET'
        });
        
        let data = await res.json();
    
        return Promise.resolve(data.salt);
    }

    /**
     * Get memos for a certain key
     * @param {*} encryptedKey Keyphrase encrypted with bcrypt
     * @returns An array of encrypted memo objects
     */
    static async getMemos(encryptedKey){
        let res = await fetch(`/memos/${encryptedKey}`, {
            method: 'GET'
        });

        let data = await res.json();

        return Promise.resolve(data.memos);
    }

    /**
     * Creates a memo for a certain key
     * @param {*} encryptedKey Keyphrase encrypted with bcrypt
     * @param {*} encryptedMemo Encrypted hex string of the memo to insert
     * @param {*} iv The initialization vector used to encrypt the memo
     * @returns The inserted memo object to the server database
     */
    static async createMemo(encryptedKey, encryptedMemo, iv){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let res = await fetch(`/memos/${encryptedKey}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                memobytes: encryptedMemo,
                iv: iv
            })
        });

        let data = await res.json();

        return Promise.resolve(data.memoobject);
    }

    static async updateMemo(encryptedKey, memoid, encryptedMemo, iv){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let res = await fetch(`/memos/${encryptedKey}/${memoid}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                memobytes: encryptedMemo,
                iv: iv
            })
        });

        let data = await res.json();

        return Promise.resolve(data.memoobject);
    }
}
