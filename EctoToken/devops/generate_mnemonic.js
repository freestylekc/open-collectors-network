var bip39 = require('bip39');
var CryptoJS = require("crypto-js");
var fs = require('fs');
var readlineSync = require('readline-sync');

var p = readlineSync.question('Enter password? ', {
    hideEchoBack: true // The typed text on screen is hidden by `*` (default).
});

var p2 = readlineSync.question('Enter again? ', {
    hideEchoBack: true // The typed text on screen is hidden by `*` (default).
});

if (p != p2)
    return;

var mnemonic = bip39.generateMnemonic()
console.log("Mnemonic word count=" + mnemonic.split(' ').length)

var encrypted = CryptoJS.AES.encrypt(mnemonic, p);
console.log("Encrypted=" + encrypted.toString());
fs.writeFileSync("encryptedmnemonic.txt", encrypted + "\n");


