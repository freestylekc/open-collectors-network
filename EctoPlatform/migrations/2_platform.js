var BigNumber = require('bignumber.js')
var Moment = require('moment')
var EctoToken = artifacts.require("./EctoToken.sol")
var Trustee = artifacts.require("./Trustee.sol")
var TokenSale = artifacts.require("./TokenSale.sol")
var TokenSaleMock = artifacts.require("./TokenSaleMock.sol")
var TokenLocks = artifacts.require("./TokenSaleLocks.sol")
var SafeMath = artifacts.require("./SafeMath.sol")
var IcoPoolLibrary = artifacts.require("./IcoPoolLibrary.sol");
var CollectibleLibrary = artifacts.require("./CollectibleLibrary.sol");
var Platform = artifacts.require("./Collectible.sol");
var AuctionManager = artifacts.require("./AuctionManager.sol");
var IcoPool = artifacts.require("./IcoPool.sol");
var DummyToken = artifacts.require("./DummyToken.sol");
var DummySale = artifacts.require("./DummySale.sol");
var ERC20 = artifacts.require("./ERC20Token.sol");
var FixedPriceAuction = artifacts.require("./FixedPriceAuction.sol");
var AuctionManager = artifacts.require("./AuctionManager.sol");
var fs = require('fs');
var Promise = require('bluebird');

const DECIMALSFACTOR = new BigNumber('10').pow('18')
const TOKEN_SYMBOL = "Ecto"
const TOKEN_NAME = "Open Collectibles Network"
const TOKEN_DECIMALS = 18
const END_TIME = 1518998400;
const CONTRIBUTION_MIN = web3.toWei(0.1, "ether")
const CONTRIBUTION_1ETH = web3.toWei(1, "ether")
const CONTRIBUTION_MAX = web3.toWei("10000", "ether")
const CONTRIBUTION_OVER = web3.toWei("10001", "ether")
const TOKENS_MAX = new BigNumber('150000000').mul(DECIMALSFACTOR)
const TOKENS_SALE = new BigNumber('105000000').mul(DECIMALSFACTOR)
const TOKENS_FOUNDERS = new BigNumber('15000000').mul(DECIMALSFACTOR)
const TOKENS_COMPANY = new BigNumber('15000000').mul(DECIMALSFACTOR)
const TOKENS_ADVISORS = new BigNumber('15000000').mul(DECIMALSFACTOR)
const TOKENS_PER_KETHER_WEEK1 = new BigNumber('8500000')
const TOKENS_PER_KETHER_WEEK2 = new BigNumber('7750221')
const TOKENS_PER_KETHER_WEEK3 = new BigNumber('7250129')
const TOKENS_PER_KETHER_WEEK4 = new BigNumber('7000000')

var token = null
var trustee = null
var sale = null
var lockBox = null

function getFormattedTime()
{
    var today = new Date();
    var y = today.getFullYear();
    var m = today.getMonth();
    var d = today.getDate();
    var h = today.getHours();

    return y + "-" + m + "-" + d + "-" + h;
}

//START debug prop
var receipts = []
var now = new Date();
var migrationResultsFile = "migration.txt";
var gasToUseForContracts = 4700000;

function logMigration(text) 
{
    console.log(text);

    if (fs.existsSync(migrationResultsFile))
        fs.appendFileSync(migrationResultsFile, text + "\r\n");
    else
        fs.writeFileSync(migrationResultsFile, text + "\r\n");
}

web3.eth.getBalance = Promise.promisify(web3.eth.getBalance);

module.exports = function (deployer, network, accounts)
{
    deployer.then(async () =>
    {
        const NUMBER_OF_ADVISORS = 2;

        const ownerAddress = accounts[0]
        const admin = accounts[1]
        const logistics = accounts[2]
        const wallet = accounts[3]
        const founder1 = accounts[4]
        const founder2 = accounts[5]
        const whitelisted1 = accounts[6]
        const whitelisted2 = accounts[7]
        const adviser1 = accounts[8]
        const adviser2 = accounts[9]
        const company = accounts[10]

        var safemath = null;
        var icopoolhelper = null;
        var token = null;
        var trustee = null;
        var sale = null;
        var lockbox = null;
        var platform = null;
        var auctionManager = null;

        console.log("Current dir", __dirname);
        migrationResultsFile = __dirname + '/../MigrationResults/migration.log';

        if (fs.existsSync(migrationResultsFile))
            fs.unlinkSync(migrationResultsFile);

        console.log("Migrations file", migrationResultsFile);

        logMigration("Accounts summary:");
        for (i = 0; i < accounts.length; i++)
        {
            logMigration("accounts[" + i + "]=" + accounts[i]);
        }
        logMigration("\n");
        logMigration("ownerAddress=" + ownerAddress);
        logMigration("admin=" + admin);
        logMigration("logistics=" + logistics);
        logMigration("wallet=" + wallet);
        logMigration("company=" + company);
        logMigration("founder1=" + founder1);
        logMigration("founder2=" + founder2);
        logMigration("adviser1=" + adviser1);
        logMigration("adviser2=" + adviser2);
        logMigration("");

        console.log("\nExtra info");
        var ownerBalance = await web3.eth.getBalance(ownerAddress);
        console.log("Owner balance: ", web3.fromWei(ownerBalance).toNumber().toLocaleString());
        console.log("Gas to use for deployment: ", gasToUseForContracts);

        logMigration("\n\nAll contracts summary follow:");

        // safe math lib
        await deployer.deploy(SafeMath, { from: ownerAddress, gas: gasToUseForContracts });
        logMigration("SafeMath=" + SafeMath.address);
        await deployer.link(SafeMath, [Platform, EctoToken, Trustee, TokenSale, TokenLocks]);

        // collectible lib
        await deployer.deploy(CollectibleLibrary, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("CollectibleLibrary=" + CollectibleLibrary.address);
        await deployer.link(CollectibleLibrary, Platform);

        // ico pool lib
        await deployer.deploy(IcoPoolLibrary, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("IcoPoolLibrary=" + IcoPoolLibrary.address);
        await deployer.link(IcoPoolLibrary, Platform);

        // auctions manager
        await deployer.deploy(AuctionManager, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("AuctionManager=" + AuctionManager.address);
        auctionManager = await AuctionManager.deployed();

        // platform
        await deployer.deploy(Platform, AuctionManager.address, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("Platform=" + Platform.address);
        platform = await Platform.deployed();

        // set the auction manager's platform
        await auctionManager.setPlatform(Platform.address, { from: ownerAddress, gas: gasToUseForContracts });

        // ECTO token & co
        await deployer.deploy(EctoToken, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("EctoToken=" + EctoToken.address);
        token = await EctoToken.deployed();
        await deployer.deploy(Trustee, token.address, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("Trustee=" + Trustee.address);
        trustee = await Trustee.deployed();
        await deployer.deploy(TokenSale, token.address, trustee.address, wallet, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("TokenSale=" + TokenSale.address);
        sale = await TokenSale.deployed();
        await deployer.deploy(TokenLocks, token.address, sale.address, { from: ownerAddress, gas: gasToUseForContracts })
        logMigration("TokenLocks=" + TokenLocks.address);
        lockbox = await TokenLocks.deployed();

        // ECTO token ops
        logMigration("Setting admin keys");
        await token.setAdminAddress(admin, { from: ownerAddress })
        await trustee.setAdminAddress(admin, { from: ownerAddress })
        await sale.setAdminAddress(admin, { from: ownerAddress })
        logMigration("Setting logistics keys");
        await token.setLogisticsAddress(sale.address, { from: ownerAddress })
        await trustee.setLogisticsAddress(logistics, { from: ownerAddress })
        await sale.setLogisticsAddress(logistics, { from: ownerAddress })
        logMigration("Transferring tokens to sale contract...");
        await token.transfer(sale.address, TOKENS_SALE, { from: ownerAddress })
        logMigration("Transferring tokens to trustee contract...");
        var tokensToTransfer = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_FOUNDERS).sub(TOKENS_COMPANY);
        await token.transfer(trustee.address, tokensToTransfer, { from: ownerAddress })
        logMigration("Transferring tokens to founders...");
        tokensToTransfer = TOKENS_FOUNDERS / 2;
        await token.transfer(founder1, tokensToTransfer, { from: ownerAddress })
        tokensToTransfer = TOKENS_FOUNDERS / 2;
        await token.transfer(founder2, tokensToTransfer, { from: ownerAddress })
        logMigration("Transferring tokens to company...");
        await token.transfer(company, TOKENS_COMPANY, { from: ownerAddress })
        logMigration("Granting advisor allocations...");
        // grant allocations for each adviser
        if (TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_FOUNDERS).sub(TOKENS_COMPANY).toNumber() != TOKENS_ADVISORS.toNumber())
            throw "Wrong number of tokens left for advisers (in trustee)";
        var tokensToAllocate = TOKENS_ADVISORS / 2;
        trustee.grantAllocation(adviser1, tokensToAllocate, true, { from: admin });
        trustee.grantAllocation(adviser2, tokensToAllocate, true, { from: admin });
        logMigration("Initializing token sale...");

        // initialize token sale
        await sale.initialize({ from: ownerAddress })
        logMigration("Token sale initialized!");

        // create contracts.js file
        var file = __dirname + '/../MigrationResults/contracts.js';
        if (fs.existsSync(file))
            fs.unlinkSync(file);

        fs.appendFileSync(file, "// Contract.address e adresa deployed\n");
        fs.appendFileSync(file, "// Contract.abi e ABI-ul\n");
        fs.appendFileSync(file, "// Contract.bytecode e codul sursa (data) dc ai vreodata nevoie sa deployezi un contract nou\n\n");

        // for now, also deploy a dummy token and a dummy sale which sells 1000 dummy tokens per ETH
        await deployer.deploy(DummyToken, { from: accounts[0], gas: 4000000 });
        await deployer.deploy(DummySale, DummyToken.address, { from: accounts[0], gas: 4000000 });
        var dummyToken = await DummyToken.deployed();
        var dummySale = await DummySale.deployed();
        await dummyToken.transfer(DummySale.address, (await dummyToken.balanceOf(accounts[0])), { from: accounts[0] });

        fs.appendFileSync(file, "var Platform = JSON.parse(" + escapeCode(JSON.stringify(stripDeployedContract(Platform, true))) + ");\n");
        fs.appendFileSync(file, "var IcoPool = JSON.parse(" + escapeCode(JSON.stringify(stripDeployedContract(IcoPool, false))) + ");\n");
        fs.appendFileSync(file, "var ERC20 = JSON.parse(" + escapeCode(JSON.stringify(stripDeployedContract(ERC20, false))) + ");\n");
        fs.appendFileSync(file, "var DummyToken = JSON.parse(" + escapeCode(JSON.stringify(stripDeployedContract(DummyToken, true))) + ");\n");
        fs.appendFileSync(file, "var DummySale = JSON.parse(" + escapeCode(JSON.stringify(stripDeployedContract(DummySale, true))) + ");\n");
        fs.appendFileSync(file, "var FixedPriceAuction = JSON.parse(" + escapeCode(JSON.stringify(stripDeployedContract(FixedPriceAuction, false))) + ");\n");
        fs.appendFileSync(file, "var AuctionManager = JSON.parse(" + escapeCode(JSON.stringify(stripDeployedContract(AuctionManager, true))) + ");\n");

        console.log("Created contracts.js: " + fs.statSync(file).size / 1024 + " KB");

        return Promise.all([sale.initialize({ from: ownerAddress })]);
    })

    function stripDeployedContract(contract, includeAddress)
    {
        var obj = {};

        if(includeAddress)
            obj.address = contract.address;

        obj.abi = contract.abi;
        obj.bytecode = contract.bytecode;

        return obj;
    };

    function escapeCode(json)
    {
        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };

        escapable.lastIndex = 0;
        return escapable.test(json) ? '"' + json.replace(escapable, function (a)
        {
            var c = meta[a];
            return (typeof c === 'string') ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + json + '"';
    };
}
