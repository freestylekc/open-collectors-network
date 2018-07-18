pragma solidity ^ 0.4.19;

import 'openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol';

contract PausableTokenWithExceptions is PausableToken {

    mapping(address => bool) public exceptions;

    modifier whenNotPaused() {
        require(!paused || exceptions[msg.sender]);
        _;
    }

    function addExceptions(address[] _exceptions) onlyOwner public {
        uint256 i = 0;
        for (i; i < _exceptions.length; i++)
            exceptions[_exceptions[i]] = true;
    }
}