
/*
Model representing an encrypted memo.
*/
export interface Memo{
    //Encrypted memo text as a hex string
    memobytes: string;

    //Initialization vector used to encrypt
    //this memo, as a hex string
    iv: string;

    //X and Y position of the memo on the
    //viewport. This should be a percentage
    //from 0 to 1, inclusive.
    memox: number;
    memoy: number;
}
