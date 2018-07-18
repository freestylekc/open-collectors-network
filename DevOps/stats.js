var Web3 = require('web3');
var fs = require('fs');

var BigNumber = require('bignumber.js')
const DECIMALSFACTOR = new BigNumber('10').pow('18')

var token, trustee, sale, lock, collectible;

const TOKENS_ADVISERS_COUNT = 2;
const TOKENS_ADVISERS = new BigNumber('15000000').mul(DECIMALSFACTOR)
const TOKENS_ADVISERS_BATCH_COUNT = 12; // 12 months
// We use a default for when the contract is deployed but this can be changed afterwards
// by calling the setTokensPerKEther function
// 8500 tokens for 1 eth => 0.08235 USD/token => ~ 8 500 000
var TOKENS_PER_KETHER_WEEK1= 8500000;
// 7750 tokens for 1 eth => 0.09032 USD/token => ~ 7 750 221
var TOKENS_PER_KETHER_WEEK2= 7750221;
// 7250 tokens for 1 eth => 0.09655 USD/token => ~ 7 250 129
var TOKENS_PER_KETHER_WEEK3= 7250129;
// 7250 tokens for 1 eth => 0.1 USD/token => ~ 7 000 000
var TOKENS_PER_KETHER_WEEK4= 7000000;

console.clear();
	
var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "1fnSaIvFdXvJSfFJwJQk";
var mnemonic = "cool peanut work eager erosion palace alcohol exotic also asset approve weird";


// // simple proxy to promisify the web3 api. It doesn't deal with edge cases like web3.eth.filter and contracts.
// const promisify = (inner) =>
  // new Promise((resolve, reject) =>
    // inner((err, res) => {
      // if (err) { reject(err) }

      // resolve(res);
    // })
  // );

// const proxiedWeb3Handler = {
  // // override getter                               
  // get: (target, name) => {              
    // const inner = target[name];                            
    // if (inner instanceof Function) {                       
      // // Return a function with the callback already set.  
      // return (...args) => promisify(cb => inner(...args, cb));                                                         
    // } else if (typeof inner === 'object') {                
      // // wrap inner web3 stuff                             
      // return new Proxy(inner, proxiedWeb3Handler);         
    // } else {                                               
      // return inner;                                        
    // }                                                      
  // },                                                       
// };                      

var web3 = new Web3(new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey, 0, 20));
//var web3 = new Web3(new HDWalletProvider(mnemonic, 'http://localhost:8545/', 0, 20));

run();
  
async function run()
{
	var accounts = await web3.eth.getAccounts();
    console.log("All accounts", accounts);

    ownerAddress = accounts[0]
    admin = accounts[1]
    logistics = accounts[2]
    wallet = accounts[3]
    company = accounts[10]

    founder1 = accounts[4]
    founder2 = accounts[5]
   
    whitelisted1 = accounts[6]
    whitelisted2 = accounts[7]

    adviser1 = accounts[8]
    adviser2 = accounts[9]

    var tokenAddress, trusteeAddress, saleAddress, lockAddress, collectibleAddress;

    // get last migration file
	var lastMigration = "migration.txt";
    console.log("Last migration", lastMigration);

    // contract addresses
    var contents = fs.readFileSync(__dirname + "/" + lastMigration, "utf-8");
    var lines = contents.split("\n");

    lines.forEach(function(line) 
    {
        if(line.startsWith("OcnToken="))
        {
            tokenAddress = line.substring(9, 9 + 42);
            console.log("OcnToken address", tokenAddress);
        }
        if(line.startsWith("Trustee="))
        {
            trusteeAddress = line.substring(8, 8 + 42);
            console.log("Trustee address", trusteeAddress);
        }
        if(line.startsWith("TokenSale="))
        {
            saleAddress = line.substring(10, 10 + 42);
            console.log("TokenSale address", saleAddress);
        }
        if(line.startsWith("TokenLocks="))
        {
            lockAddress = line.substring(11, 11 + 42);
            console.log("TokenLocks address", lockAddress);
        }
		if(line.startsWith("Collectible="))
        {
            collectibleAddress = line.substring(12, 12 + 42);
            console.log("Collectible address", collectibleAddress);
        }
    })

	console.log("\nBuilding contracts");
	
    var tokenAbi, trusteeAbi, saleAbi, lockAbi, collectibleAbi;

    // read contract abis
    tokenAbi = JSON.parse(fs.readFileSync(__dirname + "/build/contracts/OcnToken.json", "utf-8")).abi;
    trusteeAbi = JSON.parse(fs.readFileSync(__dirname + "/build/contracts/Trustee.json", "utf-8")).abi;
    saleAbi = JSON.parse(fs.readFileSync(__dirname + "/build/contracts/TokenSale.json", "utf-8")).abi;
    lockAbi = JSON.parse(fs.readFileSync(__dirname + "/build/contracts/TokenSaleLocks.json", "utf-8")).abi;
	collectibleAbi = JSON.parse(fs.readFileSync(__dirname + "/build/contracts/Collectible.json", "utf-8")).abi;
    //var collectibleBytecode = JSON.parse(fs.readFileSync(__dirname + "/build/contracts/Collectible.json", "utf-8")).bytecode;
	//var auctionableBytecode = JSON.parse(fs.readFileSync(__dirname + "/build/contracts/CreatableToken.json", "utf-8")).bytecode;

    // set default account
	web3.eth.defaultAccount = ownerAddress;
	var defaultAccount = web3.eth.defaultAccount;
	console.log("Default account:", defaultAccount);
	
	web3.eth.gasLimit = 4712390;
	
	// create contracts
    token = new web3.eth.Contract(tokenAbi, tokenAddress);
    trustee = new web3.eth.Contract(trusteeAbi, trusteeAddress);
    sale = new web3.eth.Contract(saleAbi, saleAddress);
    lock = new web3.eth.Contract(lockAbi, lockAddress);
	collectible = new web3.eth.Contract(collectibleAbi, collectibleAddress);

	console.log("Contracts initialized. Starting ops...");
	
	var block = await web3.eth.getBlock("latest");
	console.log("Network block gas limit: " + block.gasLimit);
	
	// // using the callback
	// var tx = await web3.eth.sendTransaction({
		// from: ownerAddress,
		// data: collectibleBytecode, // deploying a contracrt
		// gasLimit: 6712388
	// });
	// console.log(tx);
	// return;
	
	
	// // Gas estimation
	// collectible
		// .deploy({data: collectibleBytecode, gasLimit: 6712388})
		// .estimateGas(function(err, gas){
			// console.log("\n\nGas:", gas);
			// console.log("\n\nError:", err);
		// });
	// return;
	
    
	
    
	//await grantAdviserAllocationsBatchWhenTokenIsFinalized();
	
	await printTokenSaleStatistics();
	
	await printUniqueTokenStatistics();
	
	// console.log("\n	Some guys purchase tokens...");
	// await purchaseTokensDuringPublicSale();
	
	// console.log("\n	Updated balances...");
	// await printBalances();
}

async function printTokenSaleStatistics()
{
	console.log("\n\n******************** Token sale stats:");
	
	//Founders
	const founder1Balance = await token.methods.balanceOf(founder1).call();
	const founder2Balance = await token.methods.balanceOf(founder2).call();
	
	console.log('Founder 1 balance: ', founder1Balance / DECIMALSFACTOR);
	console.log('Founder 2 balance: ', founder2Balance / DECIMALSFACTOR);

	//Advisers
	const adviser1Balance = await token.methods.balanceOf(adviser1).call();
	const adviser2Balance = await token.methods.balanceOf(adviser2).call();
	const adviser1Allocation = await trustee.methods.getGrantedAmount(adviser1).call();
	const adviser2Allocation = await trustee.methods.getGrantedAmount(adviser2).call();
	
	console.log("Adviser 1 balance: " + adviser1Balance / DECIMALSFACTOR + " ( " + (adviser1Balance / adviser1Allocation * 100) + " % of final balance)");
	console.log("Adviser 2 balance: " + adviser1Balance / DECIMALSFACTOR + " ( " + (adviser2Balance / adviser2Allocation * 100) + " % of final balance)");
	
	//Whitelists
	const whitelisted1Balance = await token.methods.balanceOf(whitelisted1).call();
	const whitelisted2Balance = await token.methods.balanceOf(whitelisted2).call();
	console.log('Whitelist 1 balance: ', whitelisted1Balance / DECIMALSFACTOR);
	console.log('Whitelist 2 balance: ', whitelisted2Balance / DECIMALSFACTOR);

	//Company balance
	const companyBalance = await token.methods.balanceOf(company).call();
	console.log('Company balance: ', companyBalance / DECIMALSFACTOR);
		
	//Sale
	const saleBalance = await token.methods.balanceOf(sale.address).call();
	console.log('Sale balance: ', saleBalance / DECIMALSFACTOR);

	//Trustee
	const trusteeBalance = await token.methods.balanceOf(trustee.address).call();
	const tokensSold = await sale.methods.getTotalTokenSold().call();
	console.log('Trustee balance: ', trusteeBalance / DECIMALSFACTOR)
	console.log("Tokens sold:", tokensSold / DECIMALSFACTOR);
	console.log("\n");
}

async function printUniqueTokenStatistics()
{
	console.log("\n\n******************** Unique tokens stats:");
	
	var impl = await collectible.methods.implementsERC721().call();
	console.log("Implements standard ERC721:", impl);
	
    var totalTokenCount = await collectible.methods.totalSupply().call();
	console.log("Total tokens:", totalTokenCount);

	// print each token & owner
	for (var i = 0; i < totalTokenCount; i++) {
		var owner = await collectible.methods.ownerOf(i).call();
		var token = await collectible.methods.getCollectible(i).call();
		
		console.log("Id: " + i + ", Owner: " + owner + ", Name: " + token[0]);
	}

	console.log("\n");
}

async function purchaseTokensDuringPublicSale()
{
	// set tokensPerKEther for last week
	await sale.setTokensPerKEther(TOKENS_PER_KETHER_WEEK1, { from: admin });
	
	console.log("First guy buys 10 ether worth during first week");
	await web3.eth.sendTransaction({ from: whitelisted1, to: sale.address, value: web3.toWei(10, 'ether') })
	
	// // time travel to second week
	// var date = new Date(web3.eth.getBlock(web3.eth.blockNumber).timestamp * 1000);
	// console.log("Current time", date);
	// console.log("Time travelling into the future...");
	// web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [3.5 * 604800], id: 123 });
	// web3.eth.sendTransaction({ from: web3.eth.accounts[0] });
	// date = new Date(web3.eth.getBlock(web3.eth.blockNumber).timestamp * 1000);
	// console.log("Current time", date);
	
	// set tokensPerKEther for last week
	await sale.setTokensPerKEther(TOKENS_PER_KETHER_WEEK4, { from: admin });
	
	console.log("Second guy buys 11 ether worth during last week");
	await web3.eth.sendTransaction({ from: whitelisted2, to: sale.address, value: web3.toWei(11, 'ether') })
}

async function grantAdviserAllocationsBatchWhenTokenIsFinalized()
{
	console.log("\n	Processing advisors allocations (1 batch)...");
	
	var tokensToProcess = TOKENS_ADVISERS.div(TOKENS_ADVISERS_COUNT).div(TOKENS_ADVISERS_BATCH_COUNT);
	
	console.log("Batch size:", tokensToProcess.div(DECIMALSFACTOR).toNumber().toLocaleString());
	
	// token must be finalized (after sale), for allocations to be processed
	var tokenFinalized = await token.finalized.call();
	console.log("Token finalized:", tokenFinalized);
	
	await trustee.processAllocation(adviser1, tokensToProcess, { from: logistics });
	await trustee.processAllocation(adviser2, tokensToProcess, { from: logistics });
}

















































