pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './AuctionManagerInterface.sol';
import '../ERC721.sol';

contract AuctionBase
{
    enum AuctionType
    {
        FIXED_PRICE, TIMED_AUCTION
    }

    // interaction with tokens
    address internal tokenContractAddress;
    address internal auctionManagerAddress;
    uint256 public tokenId;
    
    // auction impl
    address public owner;
    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) public pendingReturns;
    bool public ended;

    // Events that will be fired on changes.
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);
    event Log(string text);
    event Log(address addr);
    event Log(uint256 val);
    event Log(bool val);

    // these functions' impl differ based on concrete auction type
    function bidExtraConditions() internal returns(bool);
    function auctionEndExtraConditions() internal returns(bool);
    function getAuctionType() public returns(AuctionType);

    function isEnded() public constant returns(bool)
    {
        return ended;
    }

    function initialize(address _owner, address _tokenContractAddress, address _auctionManagerAddress, uint256 _tokenId) public
    {
        owner = _owner;
        tokenContractAddress = _tokenContractAddress;
        auctionManagerAddress = _auctionManagerAddress;
        tokenId = _tokenId;
    }

    function bid() payable public
    {
        require(msg.value > highestBid);
        require(msg.sender != owner);
        require(bidExtraConditions());

        if (highestBidder != 0) 
        {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        HighestBidIncreased(msg.sender, msg.value);
        auctionEnd();
    }

    function withdraw() public
    {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) 
        {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            pendingReturns[msg.sender] = 0;

            if (!msg.sender.send(amount)) 
            {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
            }
        }
    }

    /// End the auction and send the highest bid
    /// to the owner.
    function auctionEnd() public
    {
        require(!ended); // this function has already been called
        require(auctionEndExtraConditions());

        ended = true;
        AuctionEnded(highestBidder, highestBid);

        if (highestBidder != address(0)) 
        {
            // send money to owner
            owner.transfer(highestBid);

            var tokenContract = ERC721(tokenContractAddress);

            // refactor below code into withdraw pattern (since the above transfer can throw)
            tokenContract.approve(highestBidder, tokenId);
            tokenContract.transfer(highestBidder, tokenId);

            AuctionManagerInterface(auctionManagerAddress).endAuction(tokenId);
        }
    }

    function() payable public
    {
        bid();
    }
}