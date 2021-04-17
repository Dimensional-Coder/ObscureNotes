
/*
Import libraries to be bundled with browserify for the frontend.

usage: npm run bundle
*/
var {twofish} = require('twofish');
global.window.twofish = twofish;

/*
var bcrypt = require('bcrypt');
global.window.bcrypt = bcrypt;
*/

var bcrypt = require('bcryptjs');
global.window.bcrypt = bcrypt;

