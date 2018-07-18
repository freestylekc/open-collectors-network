const Collectible = artifacts.require('./Collectible.sol')

contract('Collectible2', (accounts) => 
{
    var instance;
    var creatorAccount;
    var userAccount;
    var initialReservationPrice;
    var expectedTokensPerUser;
    var metamaskAddress= '0x394B980a4b309B5Ec3A5FDa3c205eEf44f3F936a'

    before(async function() 
    {
        // console.log("Account balances:");
        // accounts.forEach(function(account)
        // {
        //     console.log(web3.fromWei(web3.eth.getBalance(account).toString()));        
        // })
        // console.log("");

        instance = await Collectible.new();
        creatorAccount = accounts[0];
        initialReservationPrice = web3.toWei("0.2", "ether");
        web3.eth.defaultAccount = accounts[0];
        expectedTokensPerUser = 5;

        await instance.setCreationPrice.sendTransaction(initialReservationPrice, {'from': creatorAccount});

        console.log('\n');
        console.log("Contract=" + instance.address);
        console.log("Creator=" + creatorAccount);
        console.log("User=" + userAccount);
        console.log('\n');

        await web3.eth.sendTransaction({ from: accounts[0], to: metamaskAddress, value:  web3.toWei(20,  "ether") })
    })
     
	// "Leonardo Di Caprio","DEMO", "Talented,Nice", "https://ro.wikipedia.org/wiki/Leonardo_DiCaprio","http://www.pngpix.com/wp-content/uploads/2016/10/PNGPIX-COM-Leonardo-DiCaprio-PNG-Transparent-Image.png", 
	
    it('reserves expectedTokensPerUser tokens for 2 users', async () =>
    {
        for(i = 0; i < expectedTokensPerUser; i++)
        {
            var tokenName = "Token" + i.toString();
            var tx = await instance.create(tokenName, "Test category", "Test attributes", "Test link", "Test image", {'from': accounts[1], value: initialReservationPrice, gasPrice: web3.eth.gasPrice});
        }

        for(i = expectedTokensPerUser; i < 2 * expectedTokensPerUser; i++)
        {
            var tokenName = "Token" + i.toString();
            var tx = await instance.create(tokenName, "Test category", "Test attributes", "Test link", "Test image", {'from': accounts[2], value: initialReservationPrice, gasPrice: web3.eth.gasPrice});
        }
    })

    it('it checks the number of created tokens in total & per user', async () =>
    {
        var totalSupply = await instance.totalSupply.call();
        assert.equal(totalSupply.toNumber(), expectedTokensPerUser * 2, "Wrong number of total created");

        var userSupply = await instance.balanceOf.call(accounts[1]);
        assert.equal(userSupply.toNumber(), expectedTokensPerUser, "Wrong number of user tokens created");

        var userSupply = await instance.balanceOf.call(accounts[2]);
        assert.equal(userSupply.toNumber(), expectedTokensPerUser, "Wrong number of user tokens created");
    })

    it('it checks name of each created token', async () =>
    {
        for(i = 0; i < 2 * expectedTokensPerUser; i++)
        {
            var expectedTokenName = "Token" + i;

            var token = await instance.getCollectible(i);
            console.log(token);

            assert.equal(token[0], expectedTokenName, "Wrong token name found");
        }
    })
})

