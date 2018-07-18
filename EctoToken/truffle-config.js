require('babel-register');
require('babel-polyfill');

var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "1fnSaIvFdXvJSfFJwJQk";
var encryptedMnemonic = "U2FsdGVkX19nvHCwvA5fkfE1KsBubDgtyfVsNym0O+G/4Dngo5YN61hqY0+gWEIuhtrBYfQVLlhpX+M7VNHK2YCR40Yxt6t7m0KiJZkbOBFBgawVQUyTFJ9sjzD5nZRX";
var mnemonic = "cool peanut work eager erosion palace alcohol exotic also asset approve weird";
var hdwallet = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey, 0, 20);

module.exports = {
    networks: {
        testrpc: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 4400000,
            gasPrice: 36000000000
        },
        ropsten: {
            provider: hdwallet,
            network_id: 3,
            gas: 4100000,
            gasPrice: 36000000000 // 36 gwei
        }
    }
};
