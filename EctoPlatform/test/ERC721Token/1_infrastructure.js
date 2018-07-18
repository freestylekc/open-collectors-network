 const Collectible = artifacts.require('./Collectible.sol')

 contract('Collectible', (accounts) => 
 {
    var instance;
    var creatorAccount;
    var userAccount;
    var initialCreationPrice;
    
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
        initialCreationPrice = web3.toWei("0.1", "ether");
        web3.eth.defaultAccount = accounts[0];

        console.log('\n');
        console.log("Contract=" + instance.address);
        console.log("Creator=" + creatorAccount);
        console.log("User=" + userAccount);
        console.log('\n');
    })
      
    it('checks owner', async () => 
    {
        var owner = await instance.owner.call();
        console.log("Contract owner=" + owner);
        console.log("Creator account=" + creatorAccount);

        assert.equal(owner, creatorAccount, "Wrong owner");
    })

    it('checks can set Creation price by owner', async () => 
    {
        await instance.setCreationPrice.sendTransaction(initialCreationPrice, {'from': creatorAccount});
        var actualCreationPrice = await instance.creationPrice.call();
        console.log("Actual Creation price=" + web3.fromWei(actualCreationPrice));
        assert.equal(actualCreationPrice, initialCreationPrice, "Wrong Creation price by owner");
    })

    it('checks can NOT set Creation price by user', async () => 
    {
        try
        {
            await instance.setCreationPrice.sendTransaction(initialCreationPrice + 10000, {'from': userAccount});
            assert.isOk(false, "The user modified");
        }
        catch(e)
        {
            console.log("The user should fail to set the price");
        }

        var actualCreationPrice = await instance.creationPrice.call();
        console.log("Actual Creation price=" + web3.fromWei(actualCreationPrice));
        assert.equal(actualCreationPrice, initialCreationPrice, "User modified Creation price");
    })

    it('checks pausable by owner', async () => 
    {
        // pause our contract
        await instance.pause({'from': creatorAccount});

        // try to change price with owner
        try
        {
            await instance.setCreationPrice.sendTransaction(initialCreationPrice + 1000, {'from': creatorAccount});
            assert.isOk(false, "Owner can change price when paused");
        }
        catch(e)
        {
            console.log("Owner could not modify price when paused");
        }

        var actualCreationPrice = await instance.creationPrice.call();
        console.log("Actual Creation price=" + web3.fromWei(actualCreationPrice));
        assert.equal(actualCreationPrice, initialCreationPrice, "Wrong Creation price");

        // unpause our contract
        await instance.unpause({'from': creatorAccount});
    })
 })

