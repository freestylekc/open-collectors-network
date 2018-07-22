var Promise = require('bluebird');
var fs = require('fs');
var CryptoJS = require("crypto-js");


var abi = require('ethereumjs-abi')

var parameterTypes = ["uint256", "uint256", "address", "address", "uint256[]", "uint256[]"];

var decoded = abi.rawDecode(parameterTypes, Buffer.from(blockchainEncoded.substr(blockchainEncoded.length - 896), "hex"));
console.log("Encode args from the chain", blockchainEncoded.substr(blockchainEncoded.length - 896));
console.log("Decoded args from on chain", decoded.toString('hex'));


var t1 = 0x29a2241af62c0000;
var t2 = 0x1bc16d674ec80000;
var t3 = 0xde0b6b3a7640000;

t1 = "3000000000000000000";
t2 = "2000000000000000000";
t3 = "1000000000000000000";

var parameterValues = [
    "15000000000000000000",
    "6000",
    "0x49Fb8610b63A9f2f7F51e89B5ec83a10Ff64af86",
    "0x110fc94a29153ea49cef0d53df5d44a629bfc3b6", [t1, t2, t3],
    [30, 20, 10]
];

var encoded = abi.rawEncode(parameterTypes, parameterValues);

console.log("Encoded from this script", encoded);
console.log("Encoded version on chain", Buffer.from(blockchainEncoded.substr(blockchainEncoded.length - 896), "hex"));

var decoded = abi.rawDecode(parameterTypes, encoded);
console.log("Decoded from this script", decoded.toString('hex'));


console.log("Encoded");
console.log(encoded.toString('hex'));