const TruffleCollectible = artifacts.require('./Collectible.sol');
const TruffleFixedPriceAuction = artifacts.require('./FixedPriceAuction.sol');
const TruffleAuctionManager = artifacts.require('./AuctionManager.sol');
const fs = require('fs');

eval(fs.readFileSync('../../MigrationResults/contracts.js').toString());

contract('Creates a few public collectibles', () =>
{
    var platform;
    var auctionManager;
    
    it('prints addresses', async () => 
    {
        platform = TruffleCollectible.at(Platform.address);
        auctionManager = TruffleAuctionManager.at(AuctionManager.address);

        console.log("Platform address from contracts.js: " + Platform.address);
        console.log("AuctionManager address from contracts.js: " + AuctionManager.address);
        console.log("AuctionManager address from platform: ", await platform.auctionManager.call());
    })

    it('mints tokens', async () =>
    {
        var data = {};
        data.description = "Decentralization is the process of distributing or dispersing functions, powers, people or things away from a central location or authority.[1][2] While centralization, especially in the governmental sphere, is widely studied and practiced, there is no common definition or understanding of decentralization. The meaning of decentralization may vary in part because of the different ways it is applied.[3] Concepts of decentralization have been applied to group dynamics and management science in private businesses and organizations, political science, law and public administration, economics and technology.";
        data.image = "https://www.dashforcenews.com/wp-content/uploads/2017/11/Decentralization-and-Centralization.jpg";
        await platform.mintPublicToken("Decentralization rules!", JSON.stringify(data), { from: web3.eth.accounts[0] });
        await platform.mintPublicToken("Open Collectors Network FTW!", JSON.stringify(data), { from: web3.eth.accounts[0] });
        data.description = "Very talented.";

        await platform.mintPublicToken("Leo Messi", JSON.stringify(data), { from: web3.eth.accounts[1] });
        await platform.mintPublicToken("Leo di Caprio", JSON.stringify(data), { from: web3.eth.accounts[1] });
        assert.equal(await listCollectibles(), 4, "Wrong collectible count");
    })

    it('creates auctions', async () =>
    {
        console.log("Platform's auction manager: ", await platform.auctionManager.call());
        console.log("Auction manager's owner: ", await auctionManager.owner.call());
        console.log("Platform: ", platform.address);
        console.log("Account 0: ", web3.eth.accounts[0]);
        console.log("Account 1: ", web3.eth.accounts[1]);

        await platform.auctionFixedPrice(0, web3.toWei(0.1), { from: web3.eth.accounts[0] });
        await platform.auctionFixedPrice(1, web3.toWei(0.1), { from: web3.eth.accounts[0] });

        assert.notEqual(await platform.ownerOf(0), web3.eth.accounts[0], "Wrong initial owner");
        assert.notEqual(await platform.ownerOf(1), web3.eth.accounts[0], "Wrong initial owner");

        await listAuctions();
    })

    it('buys token 0', async () =>
    {
        console.log("First Auction address: ", await auctionManager.getAuction(0));
        var auction = TruffleFixedPriceAuction.at(await auctionManager.getAuction(0));
        console.log("Auction address: ", auction.address);
        await auction.bid.sendTransaction({ from: web3.eth.accounts[1], value: web3.toWei(0.1) });
        var ownerOfToken0 = await platform.ownerOf(0);
        assert.equal(ownerOfToken0, web3.eth.accounts[1], "Wrong final owner");
        assert.equal(await listAuctions(), 1, "Wrong remaining auctions in list");
    })

    async function listCollectibles()
    {
        var collectibleCount = await platform.getCollectibleCount();

        for (i = 0; i < collectibleCount; i++)
        {
            var collectible = await platform.tokens.call(i);
            console.log("\n\nCollectible " + i + ": ", collectible);

            var attributeCount = await platform.getCollectibleAttributeCount(i);

            for (j = 0; j < attributeCount; j++)
            {
                var keyValuePair = await platform.getCollectibleAttribute(i, j);
                console.log("   Attribute: ", keyValuePair);
            }
        }

        return collectibleCount;
    };

    async function listAuctions()
    {
        console.log("\n\nAuctions:");

        var auctionedTokens = await auctionManager.getAuctionedTokens();

        for (i = 0; i < auctionedTokens.length; i++)
        {
            var auctionAddress = await auctionManager.getAuction(auctionedTokens[i]);

            console.log("Token " + auctionedTokens[i] + " is auctioned at " + auctionAddress);
        }

        return auctionedTokens.length;
    };
})