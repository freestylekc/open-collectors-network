const Collectible = artifacts.require('./Collectible.sol')

contract('Collectible2', (accounts) => 
{
    var instance;
    var creatorAccount;
    var userAccount;
    var initialCreationPrice;
    var expectedNrOfTokens;
    
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
        userAccount = accounts[1];
        initialCreationPrice = web3.toWei("0.3", "ether");
        web3.eth.defaultAccount = accounts[0];
        expectedNrOfTokens = 10;

        await instance.setCreationPrice.sendTransaction(initialCreationPrice, {'from': creatorAccount});

        console.log('\n');
        console.log("Contract=" + instance.address);
        console.log("Creator=" + creatorAccount);
        console.log("User=" + userAccount);
        console.log('\n');
    })
    
    it('reserves a www.google.com token', async () => 
    {
        var tokenName = "www.google.com";
        userAccount = accounts[2];

        var price = await instance.creationPrice.call();
        var initialUserBalance = web3.eth.getBalance(userAccount);
        var initialContractBalance = web3.eth.getBalance(instance.address);

        console.log("Making reservation by sending value=" + initialCreationPrice);
        var tx = await instance.create(tokenName, "Test category", "Test attributes", "Test link", "Test image", {'from': userAccount, value: initialCreationPrice, gasPrice: web3.eth.gasPrice});

        var txCost = tx.receipt.gasUsed * web3.eth.gasPrice;

        var userBalanceAfter = web3.eth.getBalance(userAccount);
        var contractBalanceAfter = web3.eth.getBalance(instance.address);

        console.log("Price=" + parseInt(price).toLocaleString());
        console.log("Initial user balance=" + parseInt(initialUserBalance).toLocaleString());
        console.log("Gas Used=" + tx.receipt.gasUsed.toLocaleString());
        console.log("Gas price=" + parseInt(web3.eth.gasPrice).toLocaleString());
        console.log("Total tx cost=" + txCost.toLocaleString());
        console.log("Actual user balance=" + parseInt(userBalanceAfter).toLocaleString());
        console.log("Expected user balance=" + (initialUserBalance.toNumber() - price - txCost).toLocaleString());
        console.log("Initial contract balance=" + parseInt(initialContractBalance).toLocaleString());
        console.log("Actual contract balance=" + parseInt(contractBalanceAfter).toLocaleString());
        console.log("Expected contract balance=" + (parseInt(initialContractBalance) + parseInt(price)).toLocaleString());

        assert.equal(contractBalanceAfter.toNumber(), initialContractBalance.toNumber() + parseInt(price), "Wrong contract balance");
        assert.equal(userBalanceAfter.toNumber(), initialUserBalance.toNumber() - parseInt(price) - parseInt(txCost), "Wrong user balance");
    })
})

