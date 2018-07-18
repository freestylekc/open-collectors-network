pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenSTFoundation/SimpleTokenSale/blob/master/contracts/TokenSaleMock.sol
// ----------------------------------------------------------------------------
import "./EctoToken.sol";
import "./Trustee.sol";
import "./TokenSale.sol";

// wrapper over TokenSale to change time
contract TokenSaleMock is TokenSale {
   uint256 public _now;

   function TokenSaleMock(EctoToken _tokenContract, Trustee _trustee, address _wallet) public TokenSale(_tokenContract, _trustee, _wallet) TokenSaleConfig() {
      _now = now;
   }


   function currentTime() public view returns (uint256) {
      return _now;
   }


   function changeTime(uint256 _newTime) public onlyOwner returns (bool) {
      _now = _newTime;

      return true;
   }
}