const Collectible = artifacts.require('Collectible.sol')
const  FixedPriceAuction = artifacts.require('FixedPriceAuction.sol')
var fs = require('fs');
 
contract('Collectible', (accounts) => 
{
    var tokenContract;
    var creatorAccount;
    var userAccount;
    var initialCreationPrice;
    var expectedTokensPerUser;
    var auctionContractAddress;
    var tokenId = 0;
    var fixedPrice;
    var auctionBalance = 0;
	var acc1InitialBalance;
	var acc2InitialBalance;
    
    before(async function() 
    {
        tokenContract = await Collectible.deployed();
        creatorAccount = accounts[0];
        initialCreationPrice = web3.toWei("0.001", "ether");
        web3.eth.defaultAccount = accounts[0];
        expectedTokensPerUser = 5;
        fixedPrice = web3.toWei("5", "ether");
		acc1InitialBalance = web3.eth.getBalance(accounts[1]);
		acc2InitialBalance = web3.eth.getBalance(accounts[2]);
		
		console.log("Account 1 initial balance", parseInt(acc1InitialBalance));
		console.log("Account 2 initial balance", parseInt(acc2InitialBalance));
		console.log("Should expect later", (parseInt(acc1InitialBalance) + parseInt(fixedPrice)));
		
        console.log("Contract=" + tokenContract.address);
        console.log("Creator=" + creatorAccount);
        console.log('\n');
    })

        it('test web', async ()=>{
            var auction = FixedPriceAuction.at('0xa345d30db95605ff1af50eb8d2133cd297d71d20');
            console.log('auction created: ');
            console.log('fixed price: ',web3.fromWei((await auction.price.call()).toNumber()));
            console.log('highest bid: ',web3.fromWei((await auction.highestBid.call()).toNumber()));
            var bid = await auction.bid.sendTransaction({ from: accounts[17], value: web3.toWei(2, "ether"), gas: 4000000 });
            console.log('bid');
        })

    //  it('creates a couple of tokens', async () =>
    //  {
    //      await tokenContract.mintPublicToken("Leo Di Caprio", "{description: 'a very talented actor'}", {'from': accounts[1], gasPrice: web3.eth.gasPrice});
    //      await tokenContract.mintPublicToken("Jennifer Lawrence", "{description: 'a very talented actress'}", {'from': accounts[1], gasPrice: web3.eth.gasPrice});
    //  })
      
    // it('makes a fixed price auction (direct sell)', async () => 
    // {
    //     // creates the auction contract
    //     await tokenContract.auctionFixedPrice.sendTransaction(tokenId, fixedPrice, {'from': accounts[1], gasPrice: web3.eth.gasPrice});
    //     auctionContractAddress = await tokenContract.getAuction(tokenId);
    //     var tokenOwner = await tokenContract.ownerOf(tokenId);
    //     console.log("Token owner address = Auction contract = ", tokenOwner);
    //     assert.equal(tokenOwner, auctionContractAddress, "Auction contract does not own token");

    //     var auctionContract = FixedPriceAuction.at(auctionContractAddress);
    //     console.log("auctionContract", auctionContract.address);
    // })

    // it('makes 2 bad bids (too high, too low) and a good one, and ends the auction', async () => 
    // {
    //     var auctionContract = FixedPriceAuction.at(auctionContractAddress);
    //     try
    //     {
    //         await auctionContract.bid.sendTransaction({'from': accounts[2], value: web3.toWei("1", "ether"), gasPrice: web3.eth.gasPrice});
    //         assert.fail("Should not be possible");
    //     }
    //     catch(e)
    //     {
    //         console.log("Passed test with too small price.");
    //     }

    //     try
    //     {
    //         await auctionContract.bid.sendTransaction({'from': accounts[2], value: web3.toWei("10", "ether"), gasPrice: web3.eth.gasPrice});
    //         assert.fail("Should not be possible");
    //     }
    //     catch(e)
    //     {
    //         console.log("Passed test with too big price.");
    //     }

    //     await auctionContract.bid.sendTransaction({'from': accounts[2], value: fixedPrice, gasPrice: web3.eth.gasPrice});
    //     await tokenContract.auctionEnd.sendTransaction(tokenId, {'from': accounts[5], gasPrice: web3.eth.gasPrice});
    // })

    // it('checks auction ended and token final owner', async () => 
    // {
    //     var auctionContract = FixedPriceAuction.at(auctionContractAddress);

    //     var auctionEnded = await auctionContract.ended.call();
    //     console.log("Auction ended", auctionEnded);
    //     assert.equal(auctionEnded, true, "Auction is supposed to be ended by now");

    //     var tokenOwner = await tokenContract.ownerOf(tokenId);
    //     console.log("Token owner address final", tokenOwner);
    //     assert.equal(tokenOwner, accounts[2], "Wrong final token owner ");
    // })

    // it('checks balances', async () => 
    // {
    //     console.log("Auction contract balance", web3.eth.getBalance(auctionContractAddress).toNumber());
    //     console.log("Accounts[1]", web3.eth.getBalance(accounts[1]).toNumber());
    //     console.log("Accounts[2]", web3.eth.getBalance(accounts[2]).toNumber());
    //     console.log("Expecting account 1 balance of", web3.fromWei(parseInt(acc1InitialBalance) + parseInt(fixedPrice)));

    //     assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(auctionContractAddress))), 0, "Wrong account balance");
    //     assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[1]))), Math.round(web3.fromWei(parseInt(acc1InitialBalance) + parseInt(fixedPrice))), "Wrong account balance");
    //     assert.equal(Math.round(web3.fromWei(web3.eth.getBalance(accounts[2]))), Math.round(web3.fromWei(parseInt(acc2InitialBalance) - parseInt(fixedPrice))), "Wrong account balance");
    // })
})