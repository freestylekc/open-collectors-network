pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/TokenTimelock.sol
// ----------------------------------------------------------------------------


//libraries import
import "../Lib/SafeMath.sol";
//contracts import
import "./ERC20TokenInterface.sol";
import "./TokenSaleInterface.sol";
import "./Ownership.sol";


contract TokenSaleLocks is Ownership {
	using SafeMath for uint256;

	//token sale has endsAt method which tells when sale will end; tokens become unlocked only after that date
	TokenSaleInterface public tokenSale;

	//it contains transfer methods ( transfers depend on locked time )
	ERC20TokenInterface public EctoToken;

	//fixed unlocked date after which tokens can be transfered; it will be set in constructor
	uint256 public unlockDate;

	event UnlockDateExtended(uint256 _newDate);
    event TokensTransferred(address indexed _to, uint256 _value);

	function TokenSaleLocks(ERC20TokenInterface _EctoToken, TokenSaleInterface _tokenSale) Ownership() public {
		require(isAddressable(address(_tokenSale)));
		require(isAddressable(address(_EctoToken)));

		tokenSale = _tokenSale;
		EctoToken = _EctoToken;

		//set unlock date
		uint256 endsAt = tokenSale.endsAt();
		require(endsAt > 0);
		unlockDate = endsAt.add(26 weeks);
	}

	modifier onlyAfterUnlockDate() {
        require(hasUnlockDatePassed());
        _;
    }
	function hasUnlockDatePassed() public view returns (bool) {
        return currentTime() >= unlockDate;
    }

	function currentTime() public view returns (uint256) {
		return now;
	}

	function extendUnlockDate(uint256 _newDate) public onlyOwner returns (bool) {
        require(_newDate > unlockDate);

        unlockDate = _newDate;

        UnlockDateExtended(_newDate);

        return true;
    }

	//transfer from onlyOwner and onlyAfterUnlockDate
	function transfer(address _to, uint256 _value) public onlyOwner onlyAfterUnlockDate returns (bool) {
        require(EctoToken.transfer(_to, _value));

        TokensTransferred(_to, _value);

        return true;
    }
}