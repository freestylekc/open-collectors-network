pragma solidity ^0.4.18;

contract ERC20Interface {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract DummySale
{
    address public token;

    function DummySale(address _token) public 
    {
         token = _token;
    }
    
    // ------------------------------------------------------------------------
    // Simulate a buy
    // ------------------------------------------------------------------------
    function() public payable 
    {
        var erc20 = ERC20Interface(token);
        var toTransfer = msg.value * 1000 / (10 ** (18 - 2)); // 1000 tokens per ether
        erc20.transfer(msg.sender, toTransfer);
    }
}