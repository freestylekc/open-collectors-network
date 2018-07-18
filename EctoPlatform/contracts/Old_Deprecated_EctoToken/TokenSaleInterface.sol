pragma solidity ^0.4.18;

contract TokenSaleInterface {
	// for locks
    function endsAt() public view returns (uint256);
}