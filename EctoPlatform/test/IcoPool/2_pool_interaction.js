const IcoPool = artifacts.require('./IcoPool.sol')
const Token = artifacts.require('./EctoToken.sol')
const Sale = artifacts.require('./TokenSale.sol');
const ERC20 = artifacts.require('./ERC20Token.sol');
const ERC721 = artifacts.require('./Collectible.sol');
const DummyToken = artifacts.require('./DummyToken.sol');
const Collectible = artifacts.require('./Collectible.sol')
const BigNumber = require('bignumber.js')

const DECIMALSFACTOR = new BigNumber('10').pow('18')

contract('Smart pool basic tests', (accounts) => 
{
    var pool;
    var token;
    var sale;
    var platform;
    var dummyToken;
    var collectible;

    var minIndividualContribution = web3.toWei(0.1);
    var maxIndividualContribution = web3.toWei(5);
    var minTotalContribution = web3.toWei(6);
    var maxTotalContribution = web3.toWei(11);
    var currentTime = Math.floor(Date.now() / 1000);

    before(async function() 
    {
        console.log("Starting basic pool tests at:", currentTime);

        token = await Token.deployed();
        console.log("Ecto token address", token.address);

        dummyToken = await DummyToken.new({from:accounts[0], gas: 4000000});
        console.log("Dummy token address", dummyToken.address);

        platform = await ERC721.deployed();
        console.log("Non-fungible token address", platform.address);

        sale = await Sale.deployed();
        console.log("Sale address", sale.address);
        
        collectible = await Collectible.deployed();
        console.log("Collectible address", collectible.address);
    })

    it('creates a non-fungible pool', async () => {
        pool = await IcoPool.new(sale.address, minIndividualContribution, maxIndividualContribution, minTotalContribution, maxTotalContribution, currentTime + 60, false, accounts[0]);
        console.log("Pool address", pool.address);
    })

    it('enters a few participants into pool', async () =>
    {
        await web3.eth.sendTransaction({from:accounts[11], to:pool.address, value: web3.toWei(1), gas:150000});
        await web3.eth.sendTransaction({from:accounts[12], to:pool.address, value: web3.toWei(2), gas:150000});
        await web3.eth.sendTransaction({from:accounts[13], to:pool.address, value: web3.toWei(3), gas:150000});
        await web3.eth.sendTransaction({from:accounts[14], to:pool.address, value: web3.toWei(1), gas:150000});

        assert.equal(web3.fromWei(web3.eth.getBalance(pool.address)), 7, "Wrong pool eth balance");
    })

    it('token sale comes, we buy, token sale ends and we withdraw for a part of participants', async () =>
    {
        // pass some time
        await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [61], id: 0 });

        await pool.buy.sendTransaction({ from: accounts[17], gas:200000 });
        var currentPoolTokenBalance = await token.balanceOf(pool.address);
        console.log("Pool just bought " + web3.fromWei(currentPoolTokenBalance) + " tokens.");

        await sale.finalize({ from: accounts[1]});
        await token.finalize({from: accounts[1]});
        await pool.withdraw(token.address, { from: accounts[11], gas: 200000 });
        await pool.withdraw(token.address, { from: accounts[12], gas: 200000 });
    })

    it('we also force a dummy token transfer to the pool address and make some malicious withdrawals', async () =>
    {
        await dummyToken.transfer(pool.address, 100000, {from:accounts[0]});
        await pool.withdraw(dummyToken.address, {from: accounts[14], gas:200000});
    })

    it('prints the pool stats', async () =>
    {
        console.log("**********Pool status AFTER buying tokens**********");
        await printPoolInformation(pool.address);
        console.log("***************************************************");
    })


    /**
     * Same code can be used from platform to check out pool information.
     * @param {any} poolAddress The pools address.
     */
    async function printPoolInformation(poolAddress)
    {
        var pool = await IcoPool.at(poolAddress);

        // have tokens been bought yet?
        var isClosed = await pool.isClosed.call();
        console.log("Pool closed: ", isClosed);

        // current eth balance of the pool
        var currentEthBalance = await web3.eth.getBalance(pool.address);
        console.log("Current ETH balance: ", web3.fromWei(currentEthBalance).toString());

        // total contribution that was raised for this pool
        var totalContribution = await pool.totalContribution.call();
        console.log("Total contribution: ", web3.fromWei(totalContribution).toString());

        // list all ERC20 token contracts used, and the most important one
        var correctTokenAddress;
        var correctTokenContract;
        var correctTokenAddressWeight = 0;

        var i = 0;
        while (true)
        {
            try
            {
                var tokenContractAddress = await pool.usedTokenContracts.call(i);
                var tokenContract;
                if (web3.isAddress(tokenContractAddress) && tokenContractAddress.toString() != "0x0000000000000000000000000000000000000000")
                {
                    console.log("Token contract used:", tokenContractAddress);
                    tokenContract = await ERC20.at(tokenContractAddress);
                    var currentTokenBalance = await tokenContract.balanceOf(pool.address);
                    console.log("   Balance of pool:", web3.fromWei(currentTokenBalance).toString());

                    var tokenContractWeight = await pool.getTokenContractWeight(tokenContractAddress);
                    console.log("   Weight (importance):", tokenContractWeight.toNumber());

                    if (tokenContractWeight > correctTokenAddressWeight)
                    {
                        correctTokenAddress = tokenContractAddress;
                        correctTokenAddressWeight = tokenContractWeight;
                        correctTokenContract = await ERC20.at(correctTokenAddress);
                    }
                }
                i++;
            }
            catch (e)
            {
                console.log("   End of token contract array reached. LastIndex: " + (i-1));
                break;
            }
        }

        console.log("Correct token address:", correctTokenAddress);

        // participants & amounts
        i = 0;
        while (true)
        {
            try
            {
                var participant = await pool.participants(i);
                var contribution = await pool.getContribution(participant);
                var withdrawn = await pool.getWithdrawn(participant, correctTokenAddress);
                var available = 0;

                if (web3.isAddress(correctTokenAddress) && correctTokenAddress.toString() != "0x0000000000000000000000000000000000000000")
                {
                    var totalWithdrawn = web3.fromWei(await pool.getTotalWithdrawn.call(correctTokenAddress)).toNumber();
                    var poolBalance = web3.fromWei(await correctTokenContract.balanceOf(pool.address)).toNumber();
                    var maxTokensEver = poolBalance + totalWithdrawn; // add BigNumber 's
                    var userRelativeContribution = contribution / totalContribution;
                    available = maxTokensEver * userRelativeContribution - web3.fromWei(withdrawn).toNumber();
                }

                console.log("Participant: ", i);
                console.log("       Address: ", participant);
                console.log("       Contribution ETH: ", web3.fromWei(contribution).toNumber());
                console.log("       Contribution %: ", contribution / totalContribution * 100 + " %");
                console.log("       Withdrawn tokens: ", web3.fromWei(withdrawn).toNumber());
                console.log("       Available to withdraw: ", available);
                i++;
            }
            catch (e)
            {
                console.log("   End of participant array reached. LastIndex: " + (i-1));
                break;
            }
        }
    }
})

