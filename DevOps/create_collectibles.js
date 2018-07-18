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

//var web3 = new Web3(new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey, 0, 20));
var web3 = new Web3(new HDWalletProvider(mnemonic, 'http://localhost:8545/', 0, 20));

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
            console.log("TokenSale address", tokenAddress);
        }
        if(line.startsWith("TokenLocks="))
        {
            lockAddress = line.substring(11, 11 + 42);
            console.log("TokenLocks address", tokenAddress);
        }
		if(line.startsWith("Collectible="))
        {
            collectibleAddress = line.substring(12, 12 + 42);
            console.log("Collectible address", tokenAddress);
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
    
	

    // set default account
	web3.eth.defaultAccount = ownerAddress;
	var defaultAccount = web3.eth.defaultAccount;
	console.log("Default account:", defaultAccount);
	
	
	// create contracts
    token = new web3.eth.Contract(tokenAbi, tokenAddress);
    trustee = new web3.eth.Contract(trusteeAbi, trusteeAddress);
    sale = new web3.eth.Contract(saleAbi, saleAddress);
    lock = new web3.eth.Contract(lockAbi, lockAddress);
	collectible = new web3.eth.Contract(collectibleAbi, collectibleAddress);

	console.log("Contracts initialized. Creating tokens...");
	var initialCreationPrice = 0;
	
	var result;
	
	
	result = await collectible.methods.create(
			"Ferrari Spyder Corsa",
			"Cars", 
			"Classic, First Ferrari", 
			"https://www.supercars.net/blog/1948-ferrari-166-inter-spyder-corsa/",
			"https://www.supercars.net/blog/wp-content/uploads/2016/03/1948_Ferrari_166InterSpyderCorsa-0-1024.jpg",
			).send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 }); 
	console.log(result);
			
	result = await collectible.methods.create(
			"Ford Mustang Bullit",
			"Cars", 
			"Supercar, Fast", 
			"https://www.carthrottle.com/post/the-very-first-2019-ford-mustang-bullitt-sold-for-300000/",
			"https://images.cdn.circlesix.co/image/1/1000/0/uploads/posts/2018/01/f4e93a6ca9456db01bb92cd66213b09a.jpg").send(
			{ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });
	console.log(result);
			
	
		result = await collectible.methods.create(
			"Tesla Model S",
			"Cars", 
			"Electric, Fast", 
			"https://www.caranddriver.com/tesla/model-s",
			"https://buyersguide.caranddriver.com/media/assets/submodel/7651.jpg").send(
			{ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });
	
	console.log(result);
		
        result = await collectible.methods.create("BMW 318d","Cars", "Slow,Nice", "https://en.wikipedia.org/wiki/BMW_3_Series", "http://st.motortrend.com/uploads/sites/10/2016/10/2017-bmw-3-series-320i-sedan-angular-front.png?interpolation=lanczos-none&fit=around|660:439").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 320d","Cars", "Slow", "https://en.wikipedia.org/wiki/BMW_3_Series", "http://st.motortrend.com/uploads/sites/10/2016/10/2017-bmw-3-series-320i-sedan-angular-front.png?interpolation=lanczos-none&fit=around|660:439").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 325d","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_3_Series", "http://st.motortrend.com/uploads/sites/10/2016/10/2017-bmw-3-series-320i-sedan-angular-front.png?interpolation=lanczos-none&fit=around|660:439").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 328i","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_3_Series", "http://st.motortrend.com/uploads/sites/10/2016/10/2017-bmw-3-series-320i-sedan-angular-front.png?interpolation=lanczos-none&fit=around|660:439").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 335i","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_3_Series", "http://st.motortrend.com/uploads/sites/10/2016/10/2017-bmw-3-series-320i-sedan-angular-front.png?interpolation=lanczos-none&fit=around|660:439").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 335d","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_3_Series", "http://st.motortrend.com/uploads/sites/10/2016/10/2017-bmw-3-series-320i-sedan-angular-front.png?interpolation=lanczos-none&fit=around|660:439").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 340i","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_3_Series", "http://st.motortrend.com/uploads/sites/10/2016/10/2017-bmw-3-series-320i-sedan-angular-front.png?interpolation=lanczos-none&fit=around|660:439").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW M3","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_3_Series", "https://res.cloudinary.com/carsguide/image/upload/f_auto,fl_lossy,q_auto,t_default/v1/editorial/vhs/BMW-M3.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);

        result = await collectible.methods.create("BMW 520d","Cars", "Slow", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 528i","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 530d","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 535d","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 535i","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 540d","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 540i","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
        result = await collectible.methods.create("BMW 550d","Cars", "Fast", "https://en.wikipedia.org/wiki/BMW_5_Series", "https://www.bmwofflorence.com/assets/misc/12376/703579.png").send({ 'from': ownerAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice, gas: 1000000 });console.log(result);
}