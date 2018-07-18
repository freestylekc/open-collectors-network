pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenSTFoundation/SimpleTokenSale/blob/master/contracts/TokenSaleConfig.sol
// ----------------------------------------------------------------------------

import "./EctoTokenConfig.sol";

contract TokenSaleConfig is EctoTokenConfig {
    uint256 public constant CONTRIBUTION_MIN = 0.1 ether;
    uint256 public constant CONTRIBUTION_MAX = 10000.0 ether;
	uint256 public constant WEEK_DURATION_IN_SECONDS = 604800;
    uint256 public WEEEK1_START_TIME;
    uint256 public WEEEK2_START_TIME;
    uint256 public WEEEK3_START_TIME;
    uint256 public WEEEK4_START_TIME;
    uint256 public END_TIME;
   
    uint256 public constant TOKENS_SALE = 105000000 * DECIMALSFACTOR;
    uint256 public constant TOKENS_FOUNDERS = 15000000 * DECIMALSFACTOR;
    uint256 public constant TOKENS_ADVISORS = 15000000 * DECIMALSFACTOR;
    uint256 public constant TOKENS_COMPANY = 15000000 * DECIMALSFACTOR;

    // uint256 public constant TOKENS_EARLY_BACKERS = 44884831 * DECIMALSFACTOR;
    // uint256 public constant TOKENS_ACCELERATOR = 217600000 * DECIMALSFACTOR;
    // uint256 public constant TOKENS_FUTURE = 137515169 * DECIMALSFACTOR;

    // We use a default for when the contract is deployed but this can be changed afterwards
    // by calling the setTokensPerKEther function
    // 8500 tokens for 1 eth => 0.08235 USD/token => ~ 8 500 000
    uint256 public constant TOKENS_PER_KETHER_WEEK1= 8500000;
    // 7750 tokens for 1 eth => 0.09032 USD/token => ~ 7 750 221
    uint256 public constant TOKENS_PER_KETHER_WEEK2= 7750221;
    // 7250 tokens for 1 eth => 0.09655 USD/token => ~ 7 250 129
    uint256 public constant TOKENS_PER_KETHER_WEEK3= 7250129;
    // 7250 tokens for 1 eth => 0.1 USD/token => ~ 7 000 000
    uint256 public constant TOKENS_PER_KETHER_WEEK4= 7000000;

    // Constant used by buyTokens as part of the cost <-> tokens conversion.
    // 18 for ETH -> WEI, TOKEN_DECIMALS (18 for Simple Token), 3 for the K in tokensPerKEther.
    uint256 public constant PURCHASE_DIVIDER = 10**(uint256(18) - TOKEN_DECIMALS + 3);
	
	function TokenSaleConfig() public
	{
		WEEEK1_START_TIME = now;
		WEEEK2_START_TIME = WEEEK1_START_TIME + WEEK_DURATION_IN_SECONDS;
		WEEEK3_START_TIME = WEEEK2_START_TIME + WEEK_DURATION_IN_SECONDS;
		WEEEK4_START_TIME = WEEEK3_START_TIME + WEEK_DURATION_IN_SECONDS;
		END_TIME = WEEEK4_START_TIME + WEEK_DURATION_IN_SECONDS;
	}
}