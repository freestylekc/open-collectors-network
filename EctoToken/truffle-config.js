require('babel-register');
require('babel-polyfill');
var CryptoJS = require("crypto-js");
var fs = require('fs');
var readlineSync = require('readline-sync');
var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "1fnSaIvFdXvJSfFJwJQk";

module.exports = {
    networks:
    {
        testrpc:
        {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 4400000,
            gasPrice: 36000000000
        },
        ropsten:
        {
            provider: new HDWalletProvider("cool peanut work eager erosion palace alcohol exotic also asset approve weird", "https://ropsten.infura.io/" + infura_apikey, 0, 20),
            network_id: 3,
            gas: 4100000,
            gasPrice: 36000000000 // gwei
        },
        mainnet:
        {
            provider: new HDWalletProvider(getMnemonic(), "https://mainnet.infura.io/" + infura_apikey, 0, 20),
            network_id: 1,
            gas: 4100000,
            gasPrice: 8000000000 // gwei
        },
    }
};

function getMnemonic()
{
    // if running with --network mainnet, then we need to ask for a password, otherwise, just use a dummy mnemonic
    var runningOnMainnet = false;
    process.argv.forEach(function(val, index, array)
    {
        if (val == "mainnet")
            runningOnMainnet = true;
    });

    if (!runningOnMainnet)
        return "cool peanut work eager erosion palace alcohol exotic also asset approve weird";

    // read password from stdin
    var p = readlineSync.question('Enter password? ',
    {
        hideEchoBack: true // The typed text on screen is hidden by `*` (default).
    });

    // generate encryption key from password, in hex form, to be used as the password for crypto-js
    var salt = "some not important salt"; // not important, we only encrypt once
    var iterations = 20000;
    var key = CryptoJS.PBKDF2(p, salt,
    {
        keySize: 8,
        iterations: iterations
    }).toString().toUpperCase();
    console.log("Generated key length", key.length);
    console.log("Key", key.substr(0, 2) + "..." + key.substr(key.length - 2));

    var encrypted = fs.readFileSync("mnemonic",
    {
        "encoding": "utf8"
    });
    var mnemonic = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
    console.log("Decrypted mnemonic word count", mnemonic.split(' ').length);

    if (mnemonic.split(' ').length != 12)
        throw "Invalid decrypted mnemonic";

    return mnemonic;
}