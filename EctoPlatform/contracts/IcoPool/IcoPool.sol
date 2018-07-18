pragma solidity ^0.4.11;

import "./TokenManager.sol";

contract IcoPool is TokenManager
{
    // ERC20 token sale contract
    address public saleAddress; // send ETH here

    // if 'true', then only the creator of the pool can send the funds (ETH) to the saleAddress, otherwise, anyone can
    bool public onlyCreatorCanBuy;
    address public creator;

    event Bought();

    /**
     * Smart pool constructor. Completely decentralized, no owner or secretary.
     * @param _saleAddress The address where the total ETH amount will be sent. This should be provided by the ICO in question on their website.
     */
    function IcoPool(
        address _saleAddress,
        uint256 _minIndividualContribution,
        uint256 _maxIndividualContribution,
        uint256 _minTotalContribution,
        uint256 _maxTotalContribution,
        uint256 _minFinalizeTimestamp,
        bool _onlyCreatorCanBuy,
        address _creator
        ) EthManager(_minIndividualContribution, _maxIndividualContribution, _minTotalContribution, _maxTotalContribution, _minFinalizeTimestamp) public
    {
        saleAddress = _saleAddress;
        onlyCreatorCanBuy = _onlyCreatorCanBuy;
        creator = _creator;
    }

    /**
     * Buys tokens (invests in ICO) by sending total ETH amount to ICO token sale address. The token sale address will assign the pool address of the owner of the ERC20 tokens.
     * Can be called by anyone at any time: if the balance is 0 => revert, if the sale doesn't exist, is closed or paused => we depend on it to behave correctly and throw.
     * Most ICOs require 150,000 - 200,000 gas, but the msg.sender is free to use whatever gas limit & price he wants.
     */
    function buy() public
    {
        // we *are* safe against reentrancy due to the require(balance > 0) and the fact that we are sending it all at once

        require(!isClosed);
        require(!onlyCreatorCanBuy || msg.sender == creator);
        require(this.balance > 0);
        require(saleAddress != address(0));
        require(this.balance >= minTotalContribution);
        require(now > minFinalizeTimestamp); 
        
        isClosed = true;
        
        require(saleAddress.call.value(this.balance)());

        Bought();
    }
}