pragma solidity ^0.4.11;

import '../ERC721.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract AuctionManagerInterface
{
    function auctionFixedPrice(uint256 tokenId, uint256 price) public returns(address);
    function getAuction(uint256 tokenId) public view returns(address);
    function getInitialOwner(uint256 tokenId) public view returns(address);
    function getAuctionedTokens() public view returns(uint256[]);
    function endAuction(uint256 tokenId) public;
}