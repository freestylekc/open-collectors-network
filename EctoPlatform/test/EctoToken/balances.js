//FLOW------------------------------------------
//initial setup
//send to founder 1 
//send to founder 2
//sent to trustee account tokens for advisors
//grant locked ( cannot be reclaimed ) allocation from trustee account to advisor 1 
//grant locked ( cannot be reclaimed ) allocation from trustee account to advisor 2
//process allocation for advisor 1 with a call from owner
//process allocation for advisor 1 with a call from owner
//send to lock box account tokens for TOKEN_COMPANY

// at this point no one should be able to transfer tokens ( because it's not finalized )
// start sale
// whitelist acc 1
// whitelist acc 2
// buy from acc 1 & transfer tokens to acc 1 => check acc 1 balance
// buy from acc 2 & transfer tokens to acc 2 => check acc 2 balance
// call sale finalized 
// burn unsold tokens after sale 
// check total supply after burn
// call token finalized => at this point tokens should be transferable
// transfer token from acc 1 to acc 2
// check balances for acc 1 & acc 2
// lambo 
//FLOW------------------------------------------

console.log(1);
const Utils = require('../lib/utils.js')

console.log(2);

var BigNumber = require('bignumber.js')
var Moment = require('moment')
console.log(3);

var EctoToken = artifacts.require("./EctoToken.sol")
var Trustee = artifacts.require("./Trustee.sol")
var TokenSale = artifacts.require("./TokenSale.sol")
var TokenSaleMock = artifacts.require("./TokenSaleMock.sol")
var TokenLocks = artifacts.require("./TokenSaleLocks.sol")
var fs = require('fs');
var HDWalletProvider = require("truffle-hdwallet-provider");
console.log(4);

const DECIMALSFACTOR = new BigNumber('10').pow('18')

const TOKEN_SYMBOL   = "Ecto"
const TOKEN_NAME     = "Open Collectibles Network"
const TOKEN_DECIMALS = 18

const END_TIME = 1518998400; 
const CONTRIBUTION_MIN = web3.toWei(0.1, "ether")
const CONTRIBUTION_1ETH = web3.toWei(1, "ether")
const CONTRIBUTION_MAX = web3.toWei("10000", "ether")
const CONTRIBUTION_OVER = web3.toWei("10001", "ether")

const TOKENS_MAX = new BigNumber('150000000').mul(DECIMALSFACTOR)
const TOKENS_SALE = new BigNumber('105000000').mul(DECIMALSFACTOR)
const TOKENS_FOUNDERS = new BigNumber('15000000').mul(DECIMALSFACTOR)
const TOKENS_ADVISORS = new BigNumber('15000000').mul(DECIMALSFACTOR)
const TOKENS_COMPANY = new BigNumber('15000000').mul(DECIMALSFACTOR)

const TOKENS_PER_KETHER_WEEK1 = new BigNumber('8500000')
const TOKENS_PER_KETHER_WEEK2 = new BigNumber('7750221')
const TOKENS_PER_KETHER_WEEK3 = new BigNumber('7250129')
const TOKENS_PER_KETHER_WEEK4 = new BigNumber('7000000')

const WEEEK1_START_TIME = 1516579200;
const WEEEK3_START_TIME = 1517788800;

var token = null
var trustee = null
var sale = null
var lockBox = null

ownerAddress = null
admin = null
logistics = null
wallet = null
company = null

founder1 = null
founder2 = null
   
whitelisted1 = null
whitelisted2 = null

NUMBER_OF_ADVISORS = 2;
advisor1 = null
advisor2 = null


contract('Statistics', (accounts) => {
    before(async function()
    {
        ownerAddress = accounts[0]
        admin = accounts[1]
        logistics = accounts[2]
        wallet = accounts[3]
        company = accounts[10]

        founder1 = accounts[4]
        founder2 = accounts[5]
   
        whitelisted1 = accounts[6]
        whitelisted2 = accounts[7]

        advisor1 = accounts[8]
        advisor2 = accounts[9]

        token = await EctoToken.deployed();
        trustee = await Trustee.deployed();
        sale = await TokenSale.deployed();
        lockBox = await TokenLocks.deployed();

        console.log("Addresses:");
        console.log("Owner", ownerAddress);
        console.log("Admin", admin);
        console.log("Logistics", logistics);
        console.log("EctoToken", token.address);
        console.log("Trustee", trustee.address);
        console.log("TokenSale", sale.address);
        console.log("TokenLocks", lockBox.address);
    })

    it('Checks balances of all parties', async () => {

        //Founders
        const founder1Balance = await token.balanceOf(founder1);
        const founder2Balance = await token.balanceOf(founder2);
        console.log('******Founders: ')
        console.log('************Founder 1 balance: ', founder1Balance.toNumber().toLocaleString())
        console.log('************Founder 2 balance: ', founder2Balance.toNumber().toLocaleString())

        //Advisors
        const advisor1Balance = await token.balanceOf(advisor1);
        const advisor2Balance = await token.balanceOf(advisor2);
        console.log('******Advisors: ')
        console.log('************Advisor 1 balance: ', advisor1Balance.toNumber().toLocaleString())
        console.log('************Advisor 2 balance: ', advisor2Balance.toNumber().toLocaleString())
            
        //Whitelists
        const whitelisted1Balance = await token.balanceOf(whitelisted1);
        const whitelisted2Balance = await token.balanceOf(whitelisted2);
        console.log('******Whitelist: ')
        console.log('************Whitelist 1 balance: ', whitelisted1Balance.toNumber().toLocaleString())
        console.log('************Whitelist 2 balance: ', whitelisted2Balance.toNumber().toLocaleString())

        //Company balance
        const companyBalance = await token.balanceOf(company);
        console.log('******Company balance: ', companyBalance.toNumber().toLocaleString())
            
        //Sale
        const saleBalance = await token.balanceOf(sale.address);
        console.log('******Sale balance: ', saleBalance.toNumber().toLocaleString())

        //Trustee
        const trusteeBalance = await token.balanceOf(trustee.address);
        console.log('******Trustee balance: ', trusteeBalance.toNumber().toLocaleString())

        var total = companyBalance
            .add(whitelisted1Balance)
            .add(whitelisted2Balance)
            .add(advisor1Balance)
            .add(advisor2Balance)
            .add(founder1Balance)
            .add(founder2Balance)
            .add(saleBalance)
            .add(trusteeBalance);

        const hardcodedSupply = (await token.getTotalSupply.call()).toNumber();
        const calculatedSupply = total.toNumber();

        console.log('******Totals: ')
        console.log('************Hard-coded MAX_SUPPLY: ', hardcodedSupply.toLocaleString())
        console.log('************Calculated     supply: ', calculatedSupply.toLocaleString())
        
        assert.equal(hardcodedSupply, calculatedSupply, "Total tokens numbers don't match up");
    })
})
