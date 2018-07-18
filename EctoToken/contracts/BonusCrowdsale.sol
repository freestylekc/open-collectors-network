pragma solidity ^ 0.4.19;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./WhitelistedPausableCrowdsale.sol";

    /**
   * @dev Allows better rates for tokens, based on Ether amounts.
   * Thresholds must be in decending order.
   */
contract BonusCrowdsale is WhitelistedPausableCrowdsale {

    uint256[] bonuses;
    uint256[] thresholds;

    constructor(uint256[] _thresholds, uint256[] _bonuses) public
    {
        setBonusThresholds(_thresholds, _bonuses);
    }

    function setBonusThresholds(uint256[] _thresholds, uint256[] _bonuses) onlyOwner public
    {
        require(_thresholds.length == _bonuses.length);

        thresholds = _thresholds;
        bonuses = _bonuses;
    }

    /**
   * @dev Overrides parent method taking into account variable rate.
   * @param _weiAmount The value in wei to be converted into tokens
   * @return The number of tokens _weiAmount wei will buy at present time
   */
    function _getTokenAmount(uint256 _weiAmount)
    internal view returns (uint256)
    {
        for (uint i = 0; i < thresholds.length; i++)
        {
            if (_weiAmount >= thresholds[i])
            {
                return _weiAmount.mul(rate.mul(100 + bonuses[i]).div(100));
            }
        }

        return _weiAmount.mul(rate);
    }
}
