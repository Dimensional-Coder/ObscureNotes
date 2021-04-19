
/*
Model representing an encrypted memo.
*/
export interface Memo{
    //Encrypted memo text as a hex string
    memobytes: string;

    //Initialization vector used to encrypt
    //this memo, as a hex string
    iv: string;
}
