const IcoPool = artifacts.require('./IcoPool.sol')
const ERC20 = artifacts.require('./ERC20Token.sol');
const DummyToken = artifacts.require('./DummyToken.sol');
const DummySale = artifacts.require('./DummySale.sol');
const SafeMath = artifacts.require('./SafeMath.sol');
const NFT = artifacts.require('./Collectible.sol')
const IcoPoolLibrary = artifacts.require('./IcoPoolLibrary.sol');
const CollectibleLibrary = artifacts.require('./CollectibleLibrary.sol');
const AuctionManager = artifacts.require('./AuctionManager.sol');
const BigNumber = require('bignumber.js')
const fs = require('fs');

contract('Initialize local TestRPC for website', (accounts) => 
{
    var pool;
    var platform;
    var dummyToken;
    var dummySale;
    var dummyPool;
    var dummyERC20;

    var minIndividualContribution = web3.toWei(0.1);
    var maxIndividualContribution = web3.toWei(5);
    var minTotalContribution = web3.toWei(6);
    var maxTotalContribution = web3.toWei(11);
    var currentTime = Math.floor(Date.now() / 1000);

    before(async function () 
    {
        console.log("Starting basic pool website initialization at:", currentTime);

        dummyToken = await DummyToken.new({ from: accounts[0], gas: 4000000 });
        console.log("Dummy token address", dummyToken.address);

        dummySale = await DummySale.new(dummyToken.address, { from: accounts[0], gas: 4000000 });
        console.log("Dummy sale address", dummySale.address);

        await dummyToken.transfer(dummySale.address, (await dummyToken.balanceOf(accounts[0])), { from: accounts[0] });

        platform = await NFT.deployed();
        console.log("NFT address", platform.address);

        dummyPool = await IcoPool.new(dummySale.address, 0, 0, 0, 0, 0, false, accounts[0], { from: accounts[0], gas: 4000000 });
        dummyERC20 = await ERC20.new("ERC20Test", "Some erc20 token", 18, 1000000, { from: accounts[0], gas: 4000000 });
    })

    it('Checks gas usage', async () =>
    {
        console.log("\n\n");
        var dummy = await NFT.new(accounts[19], { from: accounts[0], gas: 4900000 });
        var receipt = await web3.eth.getTransactionReceipt(dummy.transactionHash);
        console.log("Platform deploy gas usage: ", receipt.gasUsed.toLocaleString());
        assert.isBelow(receipt.gasUsed, 4700000);

        var tx = await platform.mintIcoPool(
            "Gas usage test pool",
            "This is a just a test pool for checking the gas usage.",
            "contact@opencollectors.network",
            dummySale.address,
            minIndividualContribution,
            maxIndividualContribution,
            minTotalContribution,
            maxTotalContribution,
            currentTime - 900,
            false,
            { from: accounts[0], gas: 4000000 });
        console.log("Creating a pool gas usage: ", tx.receipt.gasUsed.toLocaleString());
        assert.isBelow(tx.receipt.gasUsed, 4700000);

        dummy = await IcoPoolLibrary.new({ from: accounts[0], gas: 4900000 });
        receipt = await web3.eth.getTransactionReceipt(dummy.transactionHash);
        console.log("Ico pool library deploy gas usage: ", receipt.gasUsed.toLocaleString());
        assert.isBelow(receipt.gasUsed, 4700000);

        dummy = await SafeMath.new({ from: accounts[0], gas: 4900000 });
        receipt = await web3.eth.getTransactionReceipt(dummy.transactionHash);
        console.log("Safe math library deploy gas usage: ", receipt.gasUsed.toLocaleString());
        assert.isBelow(receipt.gasUsed, 4700000);

        dummy = await CollectibleLibrary.new({ from: accounts[0], gas: 4900000 });
        receipt = await web3.eth.getTransactionReceipt(dummy.transactionHash);
        console.log("Collectible library deploy gas usage: ", receipt.gasUsed.toLocaleString());
        assert.isBelow(receipt.gasUsed, 4700000);

        dummy = await AuctionManager.new({ from: accounts[0], gas: 4900000 });
        receipt = await web3.eth.getTransactionReceipt(dummy.transactionHash);
        console.log("Auction manager deploy gas usage: ", receipt.gasUsed.toLocaleString());
        assert.isBelow(receipt.gasUsed, 4700000);
    })
})

