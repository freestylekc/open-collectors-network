pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/ownership/Ownable.sol
// ----------------------------------------------------------------------------

//Based on zeppelin Ownable.sol contract with added intermediary step for safety reason
//Ownership is transferred to a intermediary first and then to final owner, only if intermediary transfers ownership again
contract Ownership {
	address public owner;
	address public intermediary;

	event InitializedOwnershipTransfer(address indexed _intermediary);
	event FinalizedOwnershipTransfer(address indexed _finalOwner);

	// debug
    event Log(string val);
    event Log(uint256 val);
    event Log(address val);

	function Ownership() public {
		owner = msg.sender;
	}


	modifier onlyOwner() {
        require(isOwner(msg.sender));
        _;
    }

	modifier onlyIntermediary(){
		require(isIntermediary(msg.sender));
		_;
	}

	function isAddressable(address _address) internal pure returns (bool) {
		return (_address != address(0));
	}

	function isOwner(address _address) internal view returns (bool) {
        return (_address == owner);
    }

	function isIntermediary(address _address) internal view returns (bool) {
		return (_address == intermediary);
	}


    function initializeOwnershipTransfer(address _intermediary) public onlyOwner returns (bool) {
        intermediary = _intermediary;

        InitializedOwnershipTransfer(_intermediary);

        return true;
    }


    function endOwnershipTransfer() public returns (bool) {
		require(isIntermediary(msg.sender));

        owner = intermediary;
        intermediary = address(0);

        FinalizedOwnershipTransfer(owner);

        return true;
    }
}



	