const TruffleDummySale = artifacts.require('./DummySale.sol');
const TruffleCollectible = artifacts.require('./Collectible.sol')
const BigNumber = require('bignumber.js')
const fs = require('fs');

eval(fs.readFileSync('../../MigrationResults/contracts.js').toString());

contract('Creates some example pools', (accounts) => 
{
    var pool;
    var platform;
    var dummyToken;
    var dummySale;
    var dummyPool;
    var dummyERC20;
    var dummyAuction;
    var dummyAuctionManager;

    var minIndividualContribution = web3.toWei(0.1);
    var maxIndividualContribution = web3.toWei(5);
    var minTotalContribution = web3.toWei(6);
    var maxTotalContribution = web3.toWei(11);
    var currentTime = Math.floor(Date.now() / 1000);

    before(async function () 
    {
        platform = TruffleCollectible.at(Platform.address);
        dummySale = TruffleDummySale.at(DummySale.address);
    })

    it('creates a few non-fungible pools', async () =>
    {
        var tx = await platform.mintIcoPool(
            "1st test pool",
            "This is a just a test pool for a dummy token sale & dummy token.",
            "contact@opencollectors.network",
            dummySale.address,
            minIndividualContribution,
            maxIndividualContribution,
            minTotalContribution,
            maxTotalContribution,
            currentTime - 900, false,
            { from: accounts[0], gas: 4000000 });

        await platform.mintIcoPool(
            "2nd test pool-limited",
            "This is 2nd test pool for a dummy token sale & dummy token.",
            "contact@opencollectors.network",
            dummySale.address,
            minIndividualContribution,
            maxIndividualContribution,
            minTotalContribution,
            maxTotalContribution,
            currentTime - 900, true,
            { from: accounts[0], gas: 4000000 });

    })

    it('lists all pool tokens', async () => 
    {
        var collectibleCount = await platform.getCollectibleCount();

        for (i = 0; i < collectibleCount; i++)
        {
            var collectible = await platform.tokens.call(i);
            console.log("Collectible " + i + ": ", collectible);

            var attributeCount = await platform.getCollectibleAttributeCount(i);

            for (j = 0; j < attributeCount; j++)
            {
                var keyValuePair = await platform.getCollectibleAttribute(i, j);
                console.log("   Attribute: ", keyValuePair);
            }
        }
    })
})

