const IcoPool = artifacts.require('./IcoPool.sol')
const DummySale = artifacts.require('./DummySale.sol');
const ERC20 = artifacts.require('./ERC20Token.sol');
const DummyToken = artifacts.require('./DummyToken.sol');
const BigNumber = require('bignumber.js')

const DECIMALSFACTOR = new BigNumber('10').pow('18')

contract('Smart pool basic tests', (accounts) => 
{
    var pool;
    var platform;
    var dummyToken;
    var dummySale;
    var collectible;

    var minIndividualContribution = 0;
    var maxIndividualContribution = 0;
    var minTotalContribution = 0;
    var maxTotalContribution = 0;
    var currentTime = Math.floor(Date.now() / 1000);

    before(async function() 
    {
        console.log("Starting basic pool tests at:", currentTime);

        dummyToken = await DummyToken.new({from:accounts[0], gas: 4000000});
        console.log("Dummy token address", dummyToken.address);

        dummySale = await DummySale.new(dummyToken.address, { from: accounts[0], gas: 4000000 });
        console.log("Dummy sale address", dummySale.address);
        await dummyToken.transfer(dummySale.address, (await dummyToken.balanceOf(accounts[0])), { from: accounts[0] });

        var decimals = await dummyToken.decimals.call();
        console.log("Token decimals", decimals);
        var factor = 10 ** decimals;
        var saleTokens = await dummyToken.balanceOf(dummySale.address);
        console.log("Sale token balance", saleTokens.toNumber() / factor);
    })

    it('creates a non-fungible pool', async () => {
        pool = await IcoPool.new(dummySale.address, minIndividualContribution, maxIndividualContribution, minTotalContribution, maxTotalContribution, currentTime - 900, false, accounts[0]);
        console.log("Pool address", pool.address);
    })

    it('enters a few participants into pool', async () =>
    {
        await web3.eth.sendTransaction({from:accounts[11], to:pool.address, value: web3.toWei(1), gas:150000});
    })

    it('token sale comes, we buy, token sale ends and we withdraw for a part of participants', async () =>
    {
        await pool.buy.sendTransaction({ from: accounts[17], gas: 200000 });
        await pool.withdraw(dummyToken.address, { from: accounts[11], gas: 200000 });
    })

    it('prints the user token stats', async () =>
    {
        var decimals = await dummyToken.decimals.call();
        console.log("Token decimals", decimals);
        var factor = 10 ** decimals;

        var tokens = await dummyToken.balanceOf(accounts[11]);
        assert.equal(tokens.toNumber() / factor, 1000, "Wrong user tokens count");
    })
})

