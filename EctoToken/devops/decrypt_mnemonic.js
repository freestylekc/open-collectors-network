var bip39 = require('bip39');
var CryptoJS = require("crypto-js");
var fs = require('fs');
var readlineSync = require('readline-sync');


// read password from stdin
var p = readlineSync.question('Enter password? ', {
    hideEchoBack: true // The typed text on screen is hidden by `*` (default).
});
    
// generate encryption key from password, in hex form, to be used as the password for crypto-js
var salt = "some not important salt"; // not important, we only encrypt once
var iterations = 20000;
var key = CryptoJS.PBKDF2(p, salt, { keySize: 8, iterations: iterations }).toString().toUpperCase();
console.log("Generated key length", key.length);
console.log("Key", key.substr(0, 2) + "..." + key.substr(key.length - 2));

var encrypted = fs.readFileSync("mnemonic", { "encoding": "utf8"});
console.log("Encrypted=" + encrypted);
var mnemonic = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
console.log("Mnemonic length", mnemonic.length);
console.log("Decrypted mnemonic word count", mnemonic.split(' ').length);
console.log("Mnemonic", mnemonic);


