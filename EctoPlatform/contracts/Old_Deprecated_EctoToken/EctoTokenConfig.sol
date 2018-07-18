pragma solidity ^0.4.18;

contract EctoTokenConfig {
    string  public constant TOKEN_SYMBOL   = "ECTO";
    string  public constant TOKEN_NAME     = "Open Collectibles Network";
    uint8   public constant TOKEN_DECIMALS = 18;

    uint256 public constant DECIMALSFACTOR = 10**uint256(TOKEN_DECIMALS);
    uint256 public constant TOKENS_MAX     = 150000000 * DECIMALSFACTOR;
}