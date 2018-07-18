const Collectible = artifacts.require('./Collectible.sol')

function printToken(token) 
{
   console.log(token[0]);
   console.log(token[1].toNumber());
   console.log(token[2].toNumber());
}

contract('Collectible2', (accounts) => 
{
   var instance;
   var creatorAccount;
   var userAccount;
   var initialCreationPrice;
   var expectedTokensPerUser;
    
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
       initialCreationPrice = web3.toWei("0.2", "ether");
       web3.eth.defaultAccount = accounts[0];
       expectedTokensPerUser = 5;

       await instance.setCreationPrice.sendTransaction(initialCreationPrice, {'from': creatorAccount});

       console.log('\n');
       console.log("Contract=" + instance.address);
       console.log("Creator=" + creatorAccount);
       console.log('\n');
   })

   it('reserves expectedTokensPerUser tokens for accounts 1 & 2', async () =>
   {
       for(i = 0; i < expectedTokensPerUser; i++)
        {
            var tokenName = "Token" + i.toString();
            var tx = await instance.create(tokenName, "Test category", "Test attributes", "Test link", "Test image", {'from': accounts[1], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
        }

        for(i = expectedTokensPerUser; i < 2 * expectedTokensPerUser; i++)
        {
            var tokenName = "Token" + i.toString();
            var tx = await instance.create(tokenName, "Test category", "Test attributes", "Test link", "Test image", {'from': accounts[2], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
        }
   })
      
   it('check token ownership of the 2 users', async () =>
   {
       var user1Token = await instance.ownerOf("0");
       var user2Token = await instance.ownerOf("9");
       //assert.equal(user1Token, accounts[1], "Wrong token owner");
       //assert.equal(user2Token, accounts[2], "Wrong token owner");
   })

   it('test correct transfer - approve + transfer (acc1 => acc2)', async () =>
   {
       var tokenIndex = "0";
       var tokenInitialOwner = await instance.ownerOf(tokenIndex);
       assert.equal(tokenInitialOwner, accounts[1], "Wrong initial owner");

       // account 1 (current owner) approves transfer to account 2
       await instance.approve.sendTransaction(accounts[2], tokenIndex, {'from': accounts[1], gasPrice: web3.eth.gasPrice})

       // account 1 (current buyer) makes transfer
       await instance.transfer.sendTransaction(accounts[2], tokenIndex, {'from': accounts[1], gasPrice: web3.eth.gasPrice})

       var tokenActualOwner = await instance.ownerOf(tokenIndex);
       var acc1Supply = await instance.balanceOf(accounts[1]);
       var acc2Supply = await instance.balanceOf(accounts[2]);

       assert.equal(tokenActualOwner, accounts[2], "Wrong final token owner");
       assert.equal(acc1Supply, 4, "Wrong acc 1 supply");
       assert.equal(acc2Supply, 6, "Wrong acc 2 supply");
   })

   it('test correct transfer - approve + transfer (acc2 => acc3)', async () =>
   {
       var tokenIndex = "0";
       var tokenInitialOwner = await instance.ownerOf(tokenIndex);
       assert.equal(tokenInitialOwner, accounts[2], "Wrong initial owner");

       // account 1 (current owner) approves transfer to account 2
       await instance.approve.sendTransaction(accounts[3], tokenIndex, {'from': accounts[2], gasPrice: web3.eth.gasPrice})

       // account 1 (current buyer) makes transfer
       await instance.transfer.sendTransaction(accounts[3], tokenIndex, {'from': accounts[2], gasPrice: web3.eth.gasPrice})

       var tokenActualOwner = await instance.ownerOf(tokenIndex);
       assert.equal(tokenActualOwner, accounts[3], "Wrong final token owner");
   })

   it('test correct transfer - approve + transferFrom', async () =>
   {
       var tokenIndex = "1";

       var tokenInitialOwner = await instance.ownerOf(tokenIndex);
       console.log("Token owner=" + tokenInitialOwner);
       console.log("Acc1=" + accounts[1]);

       // account 1 (current owner) approves transfer to account 2
       await instance.approve.sendTransaction(accounts[2], tokenIndex, {'from': accounts[1], gasPrice: web3.eth.gasPrice})

       console.log("TokenIndex in js test=" + tokenIndex);
       // account 1 transfer from itself to account 2
       await instance.transferFrom.sendTransaction(accounts[1], accounts[2], tokenIndex, {'from': accounts[2], gasPrice: web3.eth.gasPrice})

       var tokenActualOwner = await instance.ownerOf(tokenIndex);
       assert.equal(tokenActualOwner, accounts[2], "Wrong token owner");
   })

   it('test correct transfer - back', async () =>
   {
       var tokenIndex = "0";

       var tokenActualOwner = await instance.ownerOf(tokenIndex);
       console.log("Token owner=" + tokenActualOwner);
       console.log("Acc1=" + accounts[1]);
       console.log("Acc2=" + accounts[2]);
       console.log("Acc3=" + accounts[3]);
       assert.equal(tokenActualOwner, accounts[3], "Wrong initial token owner");

       await instance.approve.sendTransaction(accounts[1], tokenIndex, {'from': accounts[3], gasPrice: web3.eth.gasPrice})
       await instance.transferFrom.sendTransaction(accounts[3], accounts[1], tokenIndex, {'from': accounts[1], gasPrice: web3.eth.gasPrice})

       tokenActualOwner = await instance.ownerOf(tokenIndex);
       assert.equal(tokenActualOwner, accounts[1], "Wrong token owner");

       var token = await instance.getCollectible(tokenIndex);
       printToken(token);
       assert.equal(token[2].toNumber(), 4, "Wrong transfer count");
   })

    it('test incorrect transfer - no ownership', async () =>
    {
        var tokenIndex = "2";

        // account 3 (not owner) approves transfer to account 2
        try
        {
            await instance.approve.sendTransaction(accounts[2], tokenIndex, {'from': accounts[3], gasPrice: web3.eth.gasPrice})
            fail("Should not have approved");
        }
        catch(e)
        {
        }
    })

    it('test incorrect transfer - no approval', async () =>
    {
        var tokenIndex = "2";
        var tokenInitialOwner = await instance.ownerOf(tokenIndex);
        assert.equal(tokenInitialOwner, accounts[1], "Wrong initial owner");

        // account 2 (current buyer) makes transfer
        try
        {
            await instance.transferFrom.sendTransaction(accounts[1], accounts[2], tokenIndex, {'from': accounts[2], gasPrice: web3.eth.gasPrice})
            fail("Should not have allowed transfer");                        
        }
        catch(e)
        {
        }

        var tokenActualOwner = await instance.ownerOf(tokenIndex);
        assert.equal(tokenActualOwner, accounts[1], "Wrong final token owner");
    })

    it('test incorrect transfer - approve but transfer to wrong acc', async () =>
    {
        var tokenIndex = "2";

        // account 1 (current owner) approves transfer to account 2
        await instance.approve.sendTransaction(accounts[2], tokenIndex, {'from': accounts[1], gasPrice: web3.eth.gasPrice});

        try
        {
            // account 1 (current buyer) makes transfer
            await instance.transferFrom.sendTransaction(accounts[1], accounts[3], tokenIndex, {'from': accounts[1], gasPrice: web3.eth.gasPrice});
            fail("Should not have allowed transfer to account 3");
        }
        catch(e)
        {
        }

        var tokenActualOwner = await instance.ownerOf(tokenIndex);

        assert.equal(tokenActualOwner, accounts[1], "Wrong final token owner");
    })

    it('test incorrect transfer - no actual transfer', async () =>
    {
        var tokenIndex = "2";

        // account 1 (current owner) approves transfer to account 2
        await instance.approve.sendTransaction(accounts[2], tokenIndex, {'from': accounts[1], gasPrice: web3.eth.gasPrice})

        var tokenActualOwner = await instance.ownerOf(tokenIndex);
        
        assert.equal(tokenActualOwner, accounts[1], "Wrong final token owner");
    })
})

