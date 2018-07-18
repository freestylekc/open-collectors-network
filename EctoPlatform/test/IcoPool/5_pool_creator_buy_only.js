const IcoPool = artifacts.require('./IcoPool.sol')
const DummySale = artifacts.require('./DummySale.sol');
const ERC20 = artifacts.require('./ERC20Token.sol');
const DummyToken = artifacts.require('./DummyToken.sol');
const Platform = artifacts.require('./Collectible.sol')
const BigNumber = require('bignumber.js')

const DECIMALSFACTOR = new BigNumber('10').pow('18')

contract('Smart pool basic tests', (accounts) => 
{
    var poolAddress;
    var pool;
    var minIndividualContribution = 0;
    var maxIndividualContribution = 0;
    var minTotalContribution = 0;
    var maxTotalContribution = 0;
    var currentTime = Math.floor(Date.now() / 1000);

    it('creates a non-fungible pool for some random sale address', async () =>
    {
        var platform = await Platform.deployed();

        await platform.mintIcoPool(
            "Dummy pool to test creator only can buy",
            "This is a just a test pool.",
            "contact@opencollectors.network",
            accounts[19],
            minIndividualContribution,
            maxIndividualContribution,
            minTotalContribution,
            maxTotalContribution,
            currentTime - 900,
            true,
            { from: accounts[11], gas: 4000000 });

        var collectibleCount = await platform.getCollectibleCount();

        var collectible = await platform.tokens.call(0);
        var poolAddress = await platform.getCollectibleAttribute(0, 2);

        console.log("Pool address: ", poolAddress[1]);
        pool = await IcoPool.at("0x" + poolAddress[1]);
    })

    it('enters a few participants into pool', async () =>
    {
        await web3.eth.sendTransaction({ from: accounts[11], to: pool.address, value: web3.toWei(1), gas: 150000 });
        await web3.eth.sendTransaction({ from: accounts[12], to: pool.address, value: web3.toWei(1), gas: 150000 });
    })

    it('token sale comes, we buy, token sale ends and we withdraw for a part of participants', async () =>
    {
        try
        {
            await pool.buy.sendTransaction({ from: accounts[12], gas: 200000 }); // some random participant tries to buy
            assert.fail("Only pool creator should be allowed to send funds/buy tokens");
        }
        catch (e) { }

        try
        {
            await pool.buy.sendTransaction({ from: accounts[13], gas: 200000 }); // some random participant tries to buy
            assert.fail("Only pool creator should be allowed to send funds/buy tokens");
        }
        catch (e) { }

        await pool.buy.sendTransaction({ from: accounts[11], gas: 200000 }); // pool creator tries to buy
    })
})

