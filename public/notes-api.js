
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
}