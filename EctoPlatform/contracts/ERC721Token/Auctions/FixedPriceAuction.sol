pragma solidity ^0.4.11;

import "./AuctionBase.sol";
import '../ERC721.sol';

contract FixedPriceAuction is AuctionBase
{
    uint256 public price;

    function initialize(address _owner, address _tokenContract, address _auctionManagerAddress, uint256 _tokenId, uint256 _price) public
    {
        super.initialize(_owner, _tokenContract, _auctionManagerAddress, _tokenId);
        price = _price;
    }

    function bidExtraConditions() internal returns(bool)
    {
        return msg.value == price;
    }

    function auctionEndExtraConditions() internal returns(bool)
    {
        return true;
    }

    function auctionEnd() public
    {
        super.auctionEnd();
    }

    function getAuctionType() public returns(AuctionType)
    {
        return AuctionType.FIXED_PRICE;
    }
}
