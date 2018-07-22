var EctoToken = artifacts.require("./EctoToken.sol");
var EctoTokenSale = artifacts.require("./EctoCrowdsale.sol");
var Promise = require('bluebird');
var fs = require('fs');
var CryptoJS = require("crypto-js");

web3.eth.getBalance = Promise.promisify(web3.eth.getBalance);
web3.eth.getAccounts = Promise.promisify(web3.eth.getAccounts);
web3.eth.getTransactionCount = Promise.promisify(web3.eth.getTransactionCount);
web3.eth.getBlock = Promise.promisify(web3.eth.getBlock);
web3.eth.getTransactionReceipt = Promise.promisify(web3.eth.getTransactionReceipt);


module.exports = async function(callback)
{
    await printContractStates();

    //await whitelistAddresses();

    //await printContracts();

    callback("External script done.");
}

async function printContractStates()
{
    this.token = await EctoToken.at("0x110fc94a29153ea49cef0d53df5d44a629bfc3b6");
    this.crowdsale = await EctoTokenSale.at("0x69c68eaf0a942097e3cf59999b9121e7f99cad44");

    var accounts = await web3.eth.getAccounts();
    console.log("Accounts", accounts);
    console.log("");

    var totalSupply = await this.token.totalSupply();
    console.log("Total token supply", web3.fromWei(totalSupply).toNumber().toLocaleString());

    var cap = await this.crowdsale.cap.call();
    console.log("Sale cap", web3.fromWei(cap).toNumber().toLocaleString());

    var balance = await this.token.balanceOf(this.crowdsale.address);
    console.log("Crowdsale token balance", web3.fromWei(balance).toNumber().toLocaleString());

    balance = await this.token.balanceOf(accounts[0]);
    console.log("Owner balance", web3.fromWei(balance).toNumber().toLocaleString());

    var paused = await this.token.paused.call();
    console.log("Token is: " + (paused ? "paused" : "running"));

    paused = await this.crowdsale.paused.call();
    console.log("Crowdsale is: " + (paused ? "paused" : "running"));

    console.log("Bonuses:");
    var bonusCount = await this.crowdsale.getBonusCount();
    for (var i = 0; i < bonusCount; i++)
    {
        console.log("   " + (await this.crowdsale.bonuses.call(i)) + " % for " + web3.fromWei(await this.crowdsale.thresholds.call(i)).toNumber().toLocaleString());
    }
}

async function printContracts()
{
    this.token = await EctoToken.at("0x935001f049f9a5cf76d5ca8b33ca4ac3d6849e80");
    this.crowdsale = await EctoTokenSale.at("0xB5Ca1750E4223bb102A7C2a1D679064b7D401325");

    console.log("Token contract\r\n");
    for (p in this.token)
    {
        console.log("   " + p);
    }

    console.log("\r\n\r\nSale contract\r\n");
    for (p in this.crowdsale)
    {
        console.log("   " + p);
    }
}

async function whitelistAddresses()
{
    this.token = await EctoToken.at("0x935001f049f9a5cf76d5ca8b33ca4ac3d6849e80");
    this.crowdsale = await EctoTokenSale.at("0xB5Ca1750E4223bb102A7C2a1D679064b7D401325");

    var addresses = fs.readFileSync('L:\\temp\\whitelist.csv')
        .toString()
        .split("\n")
        .map(function(val)
        {
            return val.trim();
        })

    var validAddresses = addresses
        .filter(function(val)
        {
            return isAddress(val)
        });

    var invalidAddresses = addresses
        .filter(function(val)
        {
            return !isAddress(val)
        });

    console.log("\r\n\r\nValid addresses", validAddresses.length)
    for (i in validAddresses)
    {
        console.log(validAddresses[i]);
    }

    console.log("\r\n\r\nInvalid addresses", invalidAddresses.length)
    for (i in invalidAddresses)
    {
        console.log("[" + invalidAddresses[i] + "]");
    }
    console.log("\r\n\r\n");

    await this.crowdsale.addManyToWhitelist(validAddresses);
    console.log("All valid addresses whitelisted");
}

function isAddress(address)
{
    return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}