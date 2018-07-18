pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------

//libraries import
import "../Lib/SafeMath.sol";
//contracts import
import "./ERC20TokenInterface.sol";
import "./Ownership.sol";


//Implementation
contract ERC20Token is ERC20TokenInterface, Ownership {
	using SafeMath for uint256;

    string  private tokenName;
    string  private tokenSymbol;
    uint8   private tokenDecimals;
    uint256 internal tokenTotalSupply;

	mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;

    // debug
    event Log(string val);
    event Log(uint256 val);
    event Log(address val);

	function ERC20Token(string _symbol, string _name, uint8 _decimals, uint256 _totalSupply) public Ownership() {
        tokenSymbol = _symbol;
        tokenName = _name;
        tokenDecimals = _decimals;
        tokenTotalSupply = _totalSupply;
        balances[owner] = _totalSupply;

        // According to the ERC20 standard, a token contract which creates new tokens should trigger
        // a Transfer event and transfers of 0 values must also fire the event.
        Transfer(0x0, owner, _totalSupply);
    }

	//public methods for ERC20Token properties
    function name() public view returns (string) {
        return tokenName;
    }
    function symbol() public view returns (string) {
        return tokenSymbol;
    }
    function decimals() public view returns (uint8) {
        return tokenDecimals;
    }
    function totalSupply() public view returns (uint256) {
        return tokenTotalSupply;
    }

	//helper methods
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }
    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }


	function transfer(address _to, uint256 _value) public returns (bool success) {
		
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        // SafeMath will throw if there is not enough balance.
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        
        Transfer(msg.sender, _to, _value);

        return true;
    }


    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);

        Transfer(_from, _to, _value);

        return true;
    }


    function approve(address _spender, uint256 _value) public returns (bool success) {

        allowed[msg.sender][_spender] = _value;

        Approval(msg.sender, _spender, _value);

        return true;
    }

    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

     function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        uint oldValue = allowed[msg.sender][_spender];

        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }

        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);

        return true;
    }

}