pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://raw.githubusercontent.com/OpenSTFoundation/SimpleTokenSale/master/contracts/SimpleToken.sol
// ----------------------------------------------------------------------------
// Ecto Token has extra functionality when compared to basic ERC 20 Token; it has different behaviour before & after sale finalize :
// - after finalize, there are no restrictions on token transfers - like a basic ERC 20 token
// - before finalize, only Owner and Logistics can transfer tokens ( anybody can transfer tokens back to owner )
// Ecto Token is also burnable

// Permisions
//      Transfer      ( Owner - Yes, Admin - No,  Logistics - Yes )
//      TransferFrom  ( Owner - Yes, Admin - No,  Logistics - Yes )
//      Finalize      ( Owner - No,  Admin - Yes, Logistics - No )

//configuration
import "./EctoTokenConfig.sol";

//base token
import "./ERC20Token.sol";

//roles
import "./Roles.sol";


contract EctoToken is ERC20Token, Roles, EctoTokenConfig {
    bool public finalized;

    event Burnt(address indexed _from, uint256 _amount);
    event Sender(address _sender);
    event Finalized();

    // debug
    event Log(string val);
    event Log(uint256 val);
    event Log(address val);

    function EctoToken() public  ERC20Token(TOKEN_SYMBOL, TOKEN_NAME, TOKEN_DECIMALS, TOKENS_MAX) Roles() { 
        finalized = false;
    }

    // verify if transfer is done by someone with permission
    function verifyTransfer(address _sender, address _to) private view {
        
		require(isAddressable(_sender));
        require(isAddressable(_to));

        //no restrictions
        if (!finalized) {
            require(isOwnerOrLogistics(_sender) || _to == owner);
        }
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        	
		verifyTransfer(msg.sender, _to);

        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        verifyTransfer(msg.sender, _to);


        return super.transferFrom(_from, _to, _value);
    }

    function getTotalSupply() public view onlyOwner returns (uint256) {
        return tokenTotalSupply;
    }

    function burn(uint256 _value) public returns (bool success) {
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        tokenTotalSupply = tokenTotalSupply.sub(_value);

        Burnt(msg.sender, _value);

        return true;
    }

    function finalize() external onlyAdmin returns (bool success) {
        require(!finalized);

        finalized = true;

        Finalized();

        return true;
    }
}