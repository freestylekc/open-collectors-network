var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "1fnSaIvFdXvJSfFJwJQk";
var mnemonic = "cool peanut work eager erosion palace alcohol exotic also asset approve weird"; // test mnemonic

var hdwallet = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey, 0, 20);

module.exports = {
    networks: {
		development: {
          host: "localhost",
          port: 8545,
          network_id: "*", // Match any network id
		  gas: 4400000,
          gasPrice: 7000000000
		},
        ropsten: {
            provider: hdwallet,
            network_id: 3,
            gas: 4100000,
            gasPrice: 130000000000
        }
    }
};


//1) start testrpc
// testrpc --mnemonic "cool peanut work eager erosion palace alcohol exotic also asset approve weird" --accounts 20

//2) ruleaza migration.js test
// truffle.cmd test ./test/ocnToken/migrations/migration.js --network testrpc
// truffle.cmd test ./test/6_site.js --network testrpc


//truffle.cmd compile
//truffle.cmd migrate --network testrpc --reset
//node non_truffle_ops.js

