pragma solidity ^ 0.4.19;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol';
import './PausableTokenWithExceptions.sol';

contract EctoToken is StandardBurnableToken, PausableTokenWithExceptions {
    string public constant name = "Ecto Token";
    string public constant symbol = "Ecto";
    uint8 public constant decimals = 18;

    uint256 public constant INITIAL_SUPPLY = 150000000 * (10 ** uint256(decimals));

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        emit Transfer(address(0), msg.sender, INITIAL_SUPPLY);
    }
}