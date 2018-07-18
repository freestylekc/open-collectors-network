pragma solidity ^0.4.11;

import "./AuctionBase.sol";
import '../ERC721.sol';

contract TimedAuction is AuctionBase
{
    uint public auctionEnd;

    function initialize(address _owner, address _tokenContract, address _auctionManagerAddress, uint256 _tokenId, uint _duration) public
    {
        super.initialize(_owner, _tokenContract, _auctionManagerAddress, _tokenId);
        auctionEnd = now + _duration;
    }

    function bidExtraConditions() internal returns(bool)
    {
        return now <= auctionEnd;
    }

    function auctionEndExtraConditions() internal returns(bool)
    {
        return now >= auctionEnd;
    }
   
    function auctionEnd() public
    {
        super.auctionEnd();
    }

    function getAuctionType() public returns(AuctionType)
    {
        return AuctionType.TIMED_AUCTION;
    }
}
