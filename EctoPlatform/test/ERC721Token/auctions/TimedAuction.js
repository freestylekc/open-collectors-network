//  const Collectible = artifacts.require('Collectible.sol')
//  const TimedAuction = artifacts.require('TimedAuction.sol')
//  const  FixedPriceAuction = artifacts.require('FixedPriceAuction.sol')
//  var fs = require('fs');
 
// contract('Collectible', (accounts) => 
//  {
//      var tokenContract;
//      var creatorAccount;
//      var userAccount;
//      var initialCreationPrice;
//      var expectedTokensPerUser;
//      var auctionContractAddress;
//      var tokenId = 0;
//      var duration = 5 * 60;
//      var auctionBalance = 0;
//      var metamaskAddress= '0x394B980a4b309B5Ec3A5FDa3c205eEf44f3F936a'
    
//      before(async function() 
//      {
//          tokenContract = await Collectible.new();
//          creatorAccount = accounts[0];
//          initialCreationPrice = web3.toWei("0.001", "ether");
//          web3.eth.defaultAccount = accounts[0];
//          expectedTokensPerUser = 5;


//          await tokenContract.setCreationPrice.sendTransaction(initialCreationPrice, {'from': creatorAccount});

//          //// print all account balances
//          //console.log('\n');
//          //console.log("Account balances:");
//          //accounts.forEach(function (account) {
//          //    console.log(account + " has " + web3.fromWei(web3.eth.getBalance(account).toString()));
//          //})
//          //console.log("\n");

//          // print contract & creator addresses
//          console.log("Contract=" + tokenContract.address);
//          console.log("Creator=" + creatorAccount);
//          console.log('\n');

//          // write ABI & contract address to C:\\Temp for copy-paste into website to use with the metamask web3 provider
//          fs.writeFileSync("C:\\Temp\\CryptoCarsABI.json", JSON.stringify(tokenContract.abi));
//          fs.writeFileSync("C:\\Temp\\CryptoCarsADDRESS.txt", tokenContract.address);
//          console.log("ABI file contents written to C:\\Temp\\CryptoCarsABI.json");
//          console.log("Contract address written to C:\\Temp\\CryptoCarsAddress.txt");


//          //await web3.eth.sendTransaction({ from: accounts[0], to: metamaskAddress, value:  web3.toWei(20,  "ether") })
//      })

//      it('creates a couple of tokens', async () =>
//      {
//          await tokenContract.create.sendTransaction("Leo Di Caprio", "Talented", "www.google.com", {'from': accounts[1], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
//          await tokenContract.create.sendTransaction("Leo Messi", "Talented", "www.google.com", {'from': accounts[1], value: initialCreationPrice, gasPrice: web3.eth.gasPrice});


//          // await tokenContract.create.sendTransaction("My token", "Talented", "www.google.com", {'from': metamaskAddress, value: initialCreationPrice, gasPrice: web3.eth.gasPrice});
//      })
      
//      it('creates auction for token 0 and check auction contract owns it', async () => 
//      {
//          // creates the auction contract
//          await tokenContract.auction.sendTransaction(tokenId, duration, {'from': accounts[1], gasPrice: web3.eth.gasPrice});
//          auctionContractAddress = await tokenContract.getAuction(tokenId);
//          var tokenOwner = await tokenContract.ownerOf(tokenId);
//          console.log("Token owner address = Auction contract = ", tokenOwner);
//          assert.equal(tokenOwner, auctionContractAddress, "Auction contract does not own token");
//      })

//      it('gets auctioned tokens', async () =>{
//          var tokens = await tokenContract.getAuctionedTokens();
//          assert.equal(tokens.length, 1);
//      })

//       it('makes some bids, accounts[4] = highest bid and waits for auction time to end', async () => 
//       {
//           var auctionContract = TimedAuction.at(auctionContractAddress);
//           console.log("auctionContract", auctionContract.address);

//           await auctionContract.bid.sendTransaction({'from': accounts[2], value: web3.toWei("1", "ether"), gasPrice: web3.eth.gasPrice});
//           await auctionContract.bid.sendTransaction({'from': accounts[3], value: web3.toWei("2", "ether"), gasPrice: web3.eth.gasPrice});
//           await auctionContract.bid.sendTransaction({'from': accounts[4], value: web3.toWei("3", "ether"), gasPrice: web3.eth.gasPrice});

//           console.log("bids done");

//           // time travel to make auction end
//           var date = new Date(web3.eth.getBlock(web3.eth.blockNumber).timestamp * 1000);
//           console.log("Current time", date);
//           console.log("Time travelling into the future...");
//           web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [301], id: 123 });
//           web3.eth.sendTransaction({ from: web3.eth.accounts[0] });
//           date = new Date(web3.eth.getBlock(web3.eth.blockNumber).timestamp * 1000);
//           console.log("Current time", date);
//       })

//       it('checks the balances of the auction contract & bidders', async () => 
//       {
//           console.log("Auction contract balance", web3.eth.getBalance(auctionContractAddress).toNumber());
//           console.log("Accounts[1]", web3.eth.getBalance(accounts[1]).toNumber());
//           console.log("Accounts[2]", web3.eth.getBalance(accounts[2]).toNumber());
//           console.log("Accounts[3]", web3.eth.getBalance(accounts[3]).toNumber());
//           console.log("Accounts[4]", web3.eth.getBalance(accounts[4]).toNumber());

//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(auctionContractAddress))), 6, "Wrong contract balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[1]))), 100, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[2]))), 99, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[3]))), 98, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[4]))), 97, "Wrong account balance");
//       })

//       it('ends the auction, checks that accounts[4] is the new owner', async () => 
//       {
//           await tokenContract.auctionEnd.sendTransaction(tokenId, {'from': accounts[5], gasPrice: web3.eth.gasPrice});
          
//           var auctionContract = TimedAuction.at(auctionContractAddress);
//           var auctionEnded = await auctionContract.ended.call();
//           console.log("Auction ended", auctionEnded);
//           assert.equal(auctionEnded, true, "Auction is supposed to be ended by now");

//           var tokenOwner = await tokenContract.ownerOf(tokenId);
//           console.log("Token owner address final", tokenOwner);
//           assert.equal(tokenOwner, accounts[4], "Wrong final token owner ");
//       })

//       it('checks the balances of the auction contract & bidders', async () => 
//       {
//           console.log("Auction contract balance", web3.eth.getBalance(auctionContractAddress).toNumber());
//           console.log("Accounts[1]", web3.eth.getBalance(accounts[1]).toNumber());
//           console.log("Accounts[2]", web3.eth.getBalance(accounts[2]).toNumber());
//           console.log("Accounts[3]", web3.eth.getBalance(accounts[3]).toNumber());
//           console.log("Accounts[4]", web3.eth.getBalance(accounts[4]).toNumber());

//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(auctionContractAddress))), 3, "Wrong contract balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[1]))), 103, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[2]))), 99, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[3]))), 98, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[4]))), 97, "Wrong account balance");
//       })

//       it('withdraws non-winning bids and checks balances (must be the same as initial)', async () => 
//       {
//           var auctionContract = TimedAuction.at(auctionContractAddress);
//           await auctionContract.withdraw.sendTransaction({'from': accounts[2], gasPrice: web3.eth.gasPrice});
//           await auctionContract.withdraw.sendTransaction({'from': accounts[3], gasPrice: web3.eth.gasPrice});

//           console.log("Auction contract balance", web3.eth.getBalance(auctionContractAddress).toNumber());
//           console.log("Accounts[1]", web3.eth.getBalance(accounts[1]).toNumber());
//           console.log("Accounts[2]", web3.eth.getBalance(accounts[2]).toNumber());
//           console.log("Accounts[3]", web3.eth.getBalance(accounts[3]).toNumber());
//           console.log("Accounts[4]", web3.eth.getBalance(accounts[4]).toNumber());

//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(auctionContractAddress))), 0, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[1]))), 103, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[2]))), 100, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[3]))), 100, "Wrong account balance");
//           assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[4]))), 97, "Wrong account balance");
//       })
//  })