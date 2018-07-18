pragma solidity ^0.4.18;

contract ERC20TokenInterface {

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	//base configuration stuff
	function name() public view returns (string);
    function symbol() public view returns (string);
    function decimals() public view returns (uint8);
    function totalSupply() public view returns (uint256);

	//base functions
	function balanceOf(address _owner) public view returns (uint256 balance);
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);

	//function that can trigger events
    function approve(address _spender, uint256 _value) public returns (bool success);
	function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
}
