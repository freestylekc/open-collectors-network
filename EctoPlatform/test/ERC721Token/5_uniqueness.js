const Collectible = artifacts.require('./Collectible.sol')

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

   it('creates a couple of tokens', async () =>
   {
       await instance.create.sendTransaction("Leo Di Caprio", "Talented", "Test attributes", "Test link", "Test image", {'from': accounts[1], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
       await instance.create.sendTransaction("Leo Messi", "Talented", "Test attributes", "Test link", "Test image", {'from': accounts[1], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
   })
      
   it('checks that owner cannot duplicate it', async () =>
   {
       // try to duplicate first token by owner =>
       try 
       {
           await instance.create.sendTransaction("Leo Messi", "Talented", "Test attributes", "Test link", "Test image", {'from': accounts[1], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
           fail("Should not be allowed to duplicate Leo Messi");
       }
       catch(e)
       {
       }
   })

   it('checks that another user cannot duplicate it', async () =>
   {
       // try to duplicate first token by owner =>
       try 
       {
           await instance.create.sendTransaction("Leo Messi", "Talented", "Test attributes", "Test link", "Test image", {'from': accounts[2], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
           fail("Should not be allowed to duplicate Leo Messi");
       }
       catch(e)
       {
       }
   })
})