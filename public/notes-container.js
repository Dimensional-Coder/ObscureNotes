
/**
 * Simple container object to store a
 * note container dom element actively on the page.
 */
export class NotesContainer{
    noteObject = null;
    noteContainer = null;

    constructor(noteObject, noteContainer){
        this.noteObject=noteObject;
        this.noteContainer=noteContainer;
    }
}