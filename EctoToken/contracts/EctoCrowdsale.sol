pragma solidity ^ 0.4.19;

import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/lifecycle/TokenDestructible.sol";
import "./BonusCrowdsale.sol";


//contract EctoCrowdsale is WhitelistedCrowdsale, CappedCrowdsale, BonusTokenSale, PausableTokenSale, TokenDestructible


//BonusTokenSale, TokenDestructible
contract EctoCrowdsale is BonusCrowdsale, CappedCrowdsale, TokenDestructible  
 {

    constructor(uint256 _cap, uint256 _rate, address _wallet, ERC20 _token, uint256[] _thresholds, uint256[] _bonuses) public

    CappedCrowdsale(_cap)
    BonusCrowdsale(_thresholds, _bonuses)
    Crowdsale(_rate, _wallet, _token)
    {
    }
}

/*
PausableTokenSale 				= Crowdsale, Pausable, Ownable
WhitelistedCrowdsale 			= Ownable, RBAC, Crowdsale

*/