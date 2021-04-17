
/*
Simple interface representing the mapping of a keyhash
to a salt. A keyhash is a truncated hash of a key phrase.
*/
export interface Salt{
    keyHash: string;
    salt: string;
}
