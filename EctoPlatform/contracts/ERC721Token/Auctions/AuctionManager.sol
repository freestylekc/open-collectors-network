pragma solidity ^ 0.4.11;

import '../ERC721.sol';
import './AuctionManagerInterface.sol';
import './AuctionManagerBase.sol';
import './FixedPriceAuction.sol';

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract AuctionManager is AuctionManagerInterface, AuctionManagerBase, Ownable
{
    address public platform;

    event AuctionCreated(uint256 tokenId);
    event AuctionEnded(uint256 tokenId);

    function setPlatform(address _platform) public onlyOwner
    {
        platform = _platform;
    }

    function auctionFixedPrice(uint256 tokenId, uint256 price) public returns(address)
    {
        require(msg.sender == platform);

        // create new auction contract
        var newFixedPriceAuction = new FixedPriceAuction();
        newFixedPriceAuction.initialize(tx.origin, platform, this, tokenId, price);

        // create auction struct
        Auction memory auction;
        auction.owner = tx.origin;
        auction.addr = newFixedPriceAuction;

        super.insertAuction(tokenId, newFixedPriceAuction, tx.origin);

        AuctionCreated(tokenId);

        return newFixedPriceAuction;
    }

    function endAuction(uint256 tokenId) public
    {
        require(auctions[tokenId].addr == msg.sender);

        deleteAuction(tokenId);
    }
}