pragma solidity ^0.4.11;

import "../EctoToken/ERC20Token.sol";
import "./EthManager.sol";

contract TokenManager is EthManager
{
    uint256 constant DECIMALS_FACTOR = 10 ** 6;

    event Withdrawn(address erc20Contract, uint256 val);

    // keep all used ERC20 token contract addresses + their weight (by ETH contribution)
    // under fair usage, there is only one, but we're bullet-proof
    address[] public usedTokenContracts;
    mapping (address => uint256) usedTokenContractsWeights;

    // token withdrawals by user, by erc20 contract address
    mapping(address => mapping(address => uint256)) withdrawals;

    // total token withdrawals by token address
    // we need to store the total withdrawn PER token address, because a malicious user is free to create a dummy token,
    // transfer some dummy tokens to the pool's address and then use the withdraw function, which will then work normally,
    // (not throw anything), and mess up the totalWithdrawn counter, if there was only one
    mapping(address => uint256) totalWithdrawn;

    /**
     * Uses the ERC20 token contract to transfer from the pool address to msg.sender, while calculating amounts according to user relative stake.
     */
    function withdraw(address tokenAddress) public
    {
        require(tokenAddress != address(0)); // must have valid token address set
        require(contributions[msg.sender] > 0); // user must have some contribution

        // calc below is equivalent to maxTokensEverAssignedToPool * userContributionRatio - anyAlreadyWithdrawnByUser
        // but we forced a common denominator because of no floating point in Solidity
        ERC20Token tokenContract = ERC20Token(tokenAddress);

        var amount = ((tokenContract.balanceOf(this) + totalWithdrawn[tokenAddress])
            * contributions[msg.sender] - withdrawals[msg.sender][tokenAddress] * totalContribution) 
            / totalContribution;
        
        require(amount > 0);

        withdrawals[msg.sender][tokenAddress] += amount;
        tokenContract.transfer(msg.sender, amount);
        totalWithdrawn[tokenAddress] += amount;

        Withdrawn(tokenAddress, amount);

        // if successful in withdrawing tokens, remember this token contract for logging purposes
        if (usedTokenContractsWeights[tokenAddress] == 0) // first time?
            usedTokenContracts.push(tokenAddress);

        usedTokenContractsWeights[tokenAddress] += contributions[msg.sender];
    }

    /**
     * Returns the total withdrawn tokens for a participant. Returns 0 for bad addresses.
     * @param participant The participant's address.
     */
    function getWithdrawn(address participant, address tokenAddress) public view returns(uint256)
    {
        return withdrawals[participant][tokenAddress];
    }

    /**
     * Returns the total withdrawn tokens for a token contract address. Returns 0 for bad addreses.
     * @param tokenAddress The ERC20 token contract's address.
     */
    function getTotalWithdrawn(address tokenAddress) public view returns(uint256)
    {
        return totalWithdrawn[tokenAddress];
    }

    /**
     * Returns the weight of a used ERC20 token address. Under fair usage, only one exists. Returns 0 for bad addreses.
     * @param tokenAddress The ERC20 token contract's address.
     */
    function getTokenContractWeight(address tokenAddress) public view returns(uint256)
    {
        return usedTokenContractsWeights[tokenAddress];
    }
}