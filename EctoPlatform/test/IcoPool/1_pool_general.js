const IcoPool = artifacts.require('./IcoPool.sol')
const Token = artifacts.require('./EctoToken.sol')
const Sale = artifacts.require('./TokenSale.sol');
const BigNumber = require('bignumber.js')

const DECIMALSFACTOR = new BigNumber('10').pow('18')

contract('Smart pool basic tests', (accounts) => 
{
    var pool;
    var token;
    var sale;

    var minIndividualContribution = web3.toWei(0.1);
    var maxIndividualContribution = web3.toWei(5);
    var minTotalContribution = web3.toWei(6);
    var maxTotalContribution = web3.toWei(11);

    before(async function() 
    {
        console.log("Starting basic pool tests at:");

        token = await Token.deployed();
        console.log("Token address", token.address);

        sale = await Sale.deployed();
        console.log("Sale address", sale.address);

        var minTimestamp =  (await web3.eth.getBlock('latest')).timestamp + 60;
        pool = await IcoPool.new(sale.address, minIndividualContribution, maxIndividualContribution, minTotalContribution, maxTotalContribution, minTimestamp, false, accounts[0]);
        web3.eth.defaultAccount = accounts[0];
        console.log("Pool address", pool.address);
    })
     
    it('checks pool\'s sale address', async () =>
    {
        address = await pool.saleAddress.call();
        assert.equal(address, sale.address, "Wrong pool sale address");
    })

    it('check pool limits', async () =>
    {
        var randomAccount = accounts[18];

        try
        {
            // min individual contrib
            await web3.eth.sendTransaction({from:randomAccount, to:pool.address, value: web3.toWei(0.09), gas:150000});
            assert.fail("Should not work");
        }catch(e){}

        try
        {
            // max individual contrib
            await web3.eth.sendTransaction({from:randomAccount, to:pool.address, value: web3.toWei(5.1), gas:150000});
            assert.fail("Should not work");
        }catch(e){}

        try
        {
            // min total contrib
            await web3.eth.sendTransaction({from:accounts[11], to:pool.address, value: web3.toWei(4), gas:150000}); // send 4 ETH
            await pool.buy.sendTransaction({ from: accounts[17], gas:200000 }); // try to buy tokens
            assert.fail("Should not work");
        }catch(e){}

        try
        {
            // max total contrib
            await web3.eth.sendTransaction({from:accounts[11], to:pool.address, value: web3.toWei(4), gas:150000}); // send 7.1 more ETH
            assert.fail("Should not work");
        }catch(e){}

        // finally, leave from pool
        await pool.leave.sendTransaction({from:accounts[11], gas:150000});
    })

    var acc14InitialBalance;

    it('enters a few participants into pool', async () =>
    {
        acc14InitialBalance = await web3.eth.getBalance(accounts[14]);

        await web3.eth.sendTransaction({from:accounts[11], to:pool.address, value: web3.toWei(1), gas:150000});
        await web3.eth.sendTransaction({from:accounts[12], to:pool.address, value: web3.toWei(2), gas:150000});
        await web3.eth.sendTransaction({from:accounts[13], to:pool.address, value: web3.toWei(3), gas:150000});
        await web3.eth.sendTransaction({from:accounts[14], to:pool.address, value: web3.toWei(4), gas:150000});

        // also buy some more tokens with account 17, to simulate a bonus later
        await web3.eth.sendTransaction({from:accounts[17], to:sale.address, value: web3.toWei(10), gas:150000});


        assert.equal(web3.fromWei(web3.eth.getBalance(pool.address)), 10, "Wrong pool eth balance");
    })

    it('check participant cannot join again', async () =>
    {
        try
        {
            await web3.eth.sendTransaction({ from: accounts[14], to: pool.address, value: web3.toWei(1), gas: 150000 });
            assert.fail("Should not have let account 14 to join again");
        }
        catch (e)
        {
        }
    })

    it('checks leaving a pool', async () =>
    {
        await pool.leave.sendTransaction({from:accounts[14], gas:150000});

        try
        {
            await pool.leave.sendTransaction({from:accounts[14], gas:150000});
            assert.fail("Should not be allowed to leave the pool again");
        }
        catch (e)
        {
        }
        
        var acc14NewBalance = await web3.eth.getBalance(accounts[14]);

        assert.equal(Math.round(web3.fromWei(acc14InitialBalance)), Math.round(web3.fromWei(acc14NewBalance)), "Wrong eth balance for leaver account");
        assert.equal(web3.fromWei(web3.eth.getBalance(pool.address)), 6, "Wrong pool eth balance");
    })

    it('checks cannot buy tokens before min date', async () => {

        try {
            await pool.buy.sendTransaction({ from: accounts[17], gas: 200000 });
            assert.fail("Should not be allowed to buy tokens too soon");
        }
        catch (e) {
        }
    })

    it('passes some time and buys tokens (from any account)', async () =>
    {
        await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [120], id: 0 });
        await pool.buy.sendTransaction({ from: accounts[17], gas: 200000 });

        var poolTokenBalance = await token.balanceOf(pool.address);
        var poolEthBalance = web3.fromWei(web3.eth.getBalance(pool.address));
        console.log("Pool eth balance", poolEthBalance.toString());
        console.log("Pool token balance", poolTokenBalance / DECIMALSFACTOR);
        assert.equal(poolEthBalance, 0, "Pool should be empty of ETH");
        assert.isAbove(poolTokenBalance, 0, "Pool should have some tokens");
    })

    it('no join or leave allowed after buying tokens', async () =>
    {
        try
        {
            await web3.eth.sendTransaction({ from: accounts[19], to: pool.address, value: web3.toWei(1), gas: 150000 });
            assert.fail("Should not be allowed to join now");
        }
        catch (e)
        {
        }

        try
        {
            await pool.leave.sendTransaction({from:accounts[14], gas:150000});
            assert.fail("Should not be allowed to leave the pool now");
        }
        catch (e)
        {
        }
    })

    it('finalizes token sale so we can transfer tokens directly', async () =>
    {
        console.log("Finalizing sale & token contracts, from account", accounts[1]);
        await sale.finalize({ from: accounts[1]});
        await token.finalize({from: accounts[1]});
    })

    it('withdraws tokens', async () =>
    {
        await pool.withdraw(token.address, { from: accounts[11], gas: 200000 });
        await pool.withdraw(token.address, { from: accounts[12], gas: 200000 });
        await pool.withdraw(token.address, { from: accounts[13], gas: 200000 });

        var accTokens = await token.balanceOf(pool.address);
        console.log("Pool token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[11]);
        console.log("Account 11 token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[12]);
        console.log("Account 12 token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[13]);
        console.log("Account 13 token balance", accTokens / DECIMALSFACTOR);
    })

    it('checks cannot withdraw again', async () =>
    {
        try
        {
            await pool.withdraw({ from: accounts[11], gas: 200000 });
            assert.fail("Should not be allowed to withdraw again");
        }
        catch (e)
        {
        }
    })

    it('transfers some more tokens to the pool to simulate a bonus', async () =>
    {
        await token.transfer(pool.address, 6000 * DECIMALSFACTOR, { from: accounts[17]});

        var accTokens = await token.balanceOf(pool.address);
        console.log("Pool token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[11]);
        console.log("Account 11 token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[12]);
        console.log("Account 12 token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[13]);
        console.log("Account 13 token balance", accTokens / DECIMALSFACTOR);
    })

    it('withdraws tokens after bonus', async () =>
    {
        await pool.withdraw(token.address, { from: accounts[11], gas: 200000 });
        await pool.withdraw(token.address, { from: accounts[12], gas: 200000 });
        await pool.withdraw(token.address, { from: accounts[13], gas: 200000 });

        var accTokens = await token.balanceOf(pool.address);
        console.log("Pool token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[11]);
        console.log("Account 11 token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[12]);
        console.log("Account 12 token balance", accTokens / DECIMALSFACTOR);
        var accTokens = await token.balanceOf(accounts[13]);
        console.log("Account 13 token balance", accTokens / DECIMALSFACTOR);
    })
})

